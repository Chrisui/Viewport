var Victor = require('victor');
var Bounds = require('./bounds');

// Consts
var ZOOM_MULTIPLIER = 2;

/**
 * 2d Viewport constructor
 * @param {Victor} pos Position vector
 * @param {Victor} size Size vector
 * @param {Bounds} [viewSpace]
 * @params {object} [options]
 * @constructor
 * @augments Bounds
 */
var Viewport = Bounds.extendWithConstructor(function(pos, size, viewSpace, options) {
    // Call super
    Bounds.call(this, pos, size);

    // User options
    options = options || {};

    /**
     * Describe the viewport using bounds in view space
     * NOTE: the .pos of these bounds describe the offset to client space
     * @type {Bounds}
     */
    this.viewSpace = viewSpace || new Bounds;

    /**
     * Note: Note when passing range limits if *any* size axis is set
     * then we will assume we want to limit range
     */
    this.rangeLimits = options.limit || new Bounds;

    /**
     * Cached vector containing view per plot space values for each axis
     * @type {null|Victor}
     * @private
     */
    this._viewPerPlotSpace = null;
});

/**
 * Invalidate various cached values
 */
Viewport.prototype.invalidate = function() {
    this._viewPerPlotSpace = null;
};

/**
 * Return the current view per plot space values
 * NOTE: Caches value until .invalidate() is called
 * @return Victor
 */
Viewport.prototype.getViewPerPlotSpace = function() {
    if (!this._viewPerPlotSpace) {
        if (!this.viewSpace.width || !this.viewSpace.height) {
            throw new Error('View/Client space calculations can only be done with valid view bounds!');
        }

        this._viewPerPlotSpace = new Victor(
            this.viewSpace.width / this.width,
            this.viewSpace.height / this.height
        );
    }

    return this._viewPerPlotSpace;
};

/**
 * Convert a plot space coordinate to view space coordinate
 * @param {Victor} plotCoordinate
 * @param {Victor|Boolean} [plotOriginOrAbsolute] If true then we'll assume we don't care about plot origin (ie. range position/offset)
 * @return {Victor}
 */
Viewport.prototype.plotToViewSpace = function(plotCoordinate, plotOriginOrAbsolute) {
    var viewPerPlotSpace = this.getViewPerPlotSpace();
    var viewPlotOrigin = plotOriginOrAbsolute === true
        ? new Victor(0,0)
        : plotOriginOrAbsolute || this.pos;

    return plotCoordinate.clone()
        .subtract(viewPlotOrigin)
        .multiplyX(viewPerPlotSpace.x)
        .multiplyY(viewPerPlotSpace.y);
};

/**
 * Convert a plot space coordinate to client space coordinate
 * @param {Victor} plotCoordinate
 * @param {Victor|Boolean} [plotOriginOrAbsolute] If true then we'll assume we don't care about plot origin (ie. range position/offset)
 * @return {Victor}
 */
Viewport.prototype.plotToClientSpace = function(plotCoordinate, plotOriginOrAbsolute) {
    return this.viewToClientSpace(
        this.plotToViewSpace(plotCoordinate, plotOriginOrAbsolute)
    );
};

/**
 * Convert a view space coordinate to plot space coordinate
 * @param {Victor} viewCoordinate
 * @param {Victor|Boolean} [plotOriginOrAbsolute] If true then we'll assume we don't care about plot origin (ie. range position/offset)
 * @return {Victor}
 */
Viewport.prototype.viewToPlotSpace = function(viewCoordinate, plotOriginOrAbsolute) {
    var viewPerPlotSpace = this.getViewPerPlotSpace();
    var viewPlotOrigin = plotOriginOrAbsolute === true
        ? new Victor(0,0)
        : plotOriginOrAbsolute || this.pos;

    return viewCoordinate.clone()
        .divideX(viewPerPlotSpace.x)
        .divideY(viewPerPlotSpace.y)
        .add(viewPlotOrigin);
};

/**
 * Convert a view space coordinate to client space coordinate
 * @param {Victor} viewCoordinate
 * @return {Victor}
 */
Viewport.prototype.viewToClientSpace = function(viewCoordinate) {
    return viewCoordinate.clone().add(this.viewSpace.pos);
};

/**
 * Convert a client space coordinate to view space coordinate
 * @param {Victor} clientCoordinate
 * @return {Victor}
 */
Viewport.prototype.clientToViewSpace = function(clientCoordinate) {
    return clientCoordinate.clone().subtract(this.viewSpace.pos);
};

/**
 * Convert a client space coordinate to plot space coordinate
 * @param {Victor} clientCoordinate
 * @param {Victor|Boolean} [plotOriginOrAbsolute] If true then we'll assume we don't care about plot origin (ie. range position/offset)
 * @return {Victor}
 */
Viewport.prototype.clientToPlotSpace = function(clientCoordinate, plotOriginOrAbsolute) {
    return this.viewToPlotSpace(
        this.clientToViewSpace(clientCoordinate),
        plotOriginOrAbsolute
    );
};

/**
 * Move the viewport by panDelta (plot space).
 * NOTE: Panning makes the assumption that you never want your view distorted
 *       and that the range is smaller than the range limits in the first place.
 *       Ie. We will just take the first clamp we hit (min or max end) to prevent
 *       further movement and not squeeze.
 * @param {Victor} panDelta
 */
Viewport.prototype.pan = function(panDelta) {
    var newPos = this.pos.add(panDelta);

    // Clamp on range limits if set
    if (this.rangeLimits.hasSize()) {

        var lowerLimitDelta = (new Victor(
            Math.max(this.rangeLimits.x, newPos.x),
            Math.max(this.rangeLimits.y, newPos.y)
        )).subtract(newPos);

        var upperLimitDelta = (new Victor(
            Math.min(this.rangeLimits.xMax, this.xMax),
            Math.min(this.rangeLimits.yMax, this.yMax)
        )).subtract(newPos).subtract(this.size);

        if (lowerLimitDelta.x > 0)
            this.pos.x += lowerLimitDelta.x;
        else if (upperLimitDelta.x < 0)
            this.pos.x += upperLimitDelta.x;

        if (lowerLimitDelta.y > 0)
            this.pos.y += lowerLimitDelta.y;
        else if (upperLimitDelta.y < 0)
            this.pos.y += upperLimitDelta.y;
    }
};

/**
 * Zoom on a point. Pass basicDelta and optionally zoomCoordinate (plot space)
 * @param {Number} basicDelta 1/-1
 * @param {Victor} [zoomCoordinate] If undefined we'll zoom to the center of visible range
 */
Viewport.prototype.zoom = Viewport.prototype.zoomPlotSpace = function(basicDelta, zoomCoordinate) {
    var curRangeDistance = this.size;

    // Default to zoom at center of current range
    zoomCoordinate = zoomCoordinate || this.size.clone().multiply(0.5).add(this.pos);

    var normalisedZoomPoint = zoomCoordinate.clone()
        .subtract(this.pos)
        .divideX(curRangeDistance.x)
        .divideY(curRangeDistance.y);

    // Calculate the new zoomed range distance
    var newRangeDistance = curRangeDistance.clone()[basicDelta > 0 ? 'divide' : 'multiply'](ZOOM_MULTIPLIER * Math.abs(basicDelta));

    // Set our new values
    this.size.copy(newRangeDistance);
    this.pos.copy(
        zoomCoordinate.clone()
            .subtract(
                newRangeDistance
                    .multiplyX(normalisedZoomPoint.x)
                    .multiplyY(normalisedZoomPoint.y)
            )
    );

    // viewPerPlotSpace will now be invalid
    this.invalidate();
};

/**
 * .zoom() but pass coordinate in view space (delta still absolute)
 */
Viewport.prototype.zoomViewSpace = function(basicDelta, zoomViewCoordinate) {
    this.zoomPlotSpace(
        basicDelta,
        this.viewToPlotSpace(zoomViewCoordinate)
    );
};

/**
 * .zoom() but pass coordinate in client space (delta still absolute)
 */
Viewport.prototype.zoomClientSpace = function(basicDelta, zoomClientCoordinate) {
    this.zoomPlotSpace(
        basicDelta,
        this.clientToPlotSpace(zoomClientCoordinate)
    );
};

exports = module.exports = Viewport;