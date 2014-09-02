var Victor = require('victor');
var Bounds = require('./bounds');

// Consts
var ZOOM_MULTIPLIER = 2;

/**
 * 2d Viewport constructor
 * @param {Bounds} range The visible plot range
 * @param {Bounds} viewBounds Describe the viewport using bounds
 * @params {object} options
 * @constructor
 */
var Viewport = function(range, viewBounds, options) {
    // User options
    options = options || {};

    this.range = range || new Bounds;
    this.viewBounds = viewBounds || new Bounds;
    // Note when passing range limits if *any* size axis is set
    // then we will assume we want to limit range
    this.rangeLimits = options.limit || new Bounds;

    // Default property values
    this._viewPerPlotSpace = null;
};

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
        if (!this.viewBounds.width || !this.viewBounds.height) {
            throw new Error('View/Client space calculations can only be done with valid view bounds!');
        }

        this._viewPerPlotSpace = new Victor(
            this.viewBounds.width / this.width,
            this.viewBounds.height / this.height
        );
    }

    return this._viewPerPlotSpace;
};

/**
 * Convert a plot space coordinate to view space coordinate
 * @param {Victor} plotCoordinate
 * @param {Victor|true|undefined} viewPlotOriginOrAbsolute If true then we'll assume we don't care about an origin (ie. range position/offset)
 * @return {Victor}
 */
Viewport.prototype.plotToViewSpace = function(plotCoordinate, viewPlotOriginOrAbsolute) {
    var viewPerPlotSpace = this.getViewPerPlotSpace();
    var viewPlotOrigin = viewPlotOriginOrAbsolute === true
        ? new Victor(0,0)
        : viewPlotOriginOrAbsolute || this.pos;

    return plotCoordinate.clone()
        .subtract(viewPlotOrigin)
        .multiplyX(viewPerPlotSpace.x)
        .multiplyY(viewPerPlotSpace.y);
};

/**
 * Convert a plot space coordinate to client space coordinate
 * @param {Victor} plotCoordinate
 * @return {Victor}
 */
Viewport.prototype.plotToClientSpace = function(plotCoordinate) {
    return this.viewToClientSpace(
        this.plotToViewSpace(plotCoordinate)
    );
};

/**
 * Convert a view space coordinate to plot space coordinate
 * @param {Victor} viewCoordinate
 * @return {Victor}
 */
Viewport.prototype.viewToPlotSpace = function(viewCoordinate) {
    var viewPerPlotSpace = this.getViewPerPlotSpace();

    return viewCoordinate.clone()
        .divideX(viewPerPlotSpace.x)
        .divideY(viewPerPlotSpace.y)
        .add(this.pos);
};

/**
 * Convert a view space coordinate to client space coordinate
 * @param {Victor} viewCoordinate
 * @return {Victor}
 */
Viewport.prototype.viewToClientSpace = function(viewCoordinate) {
    return viewCoordinate.clone().add(this.viewBounds.pos);
};

/**
 * Convert a client space coordinate to view space coordinate
 * @param {Victor} clientCoordinate
 * @return {Victor}
 */
Viewport.prototype.clientToViewSpace = function(clientCoordinate) {
    return clientCoordinate.clone().subtract(this.viewBounds.pos);
};

/**
 * Convert a client space coordinate to plot space coordinate
 * @param {Victor} clientCoordinate
 * @return {Victor}
 */
Viewport.prototype.clientToPlotSpace = function(clientCoordinate) {
    return this.viewToPlotSpace(
        this.clientToViewSpace(clientCoordinate)
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
 * Zoom on a point. Pass basicDelta and optionally zoomCoordinate
 * NOTE: Plot space!
 * @param {Number} basicDelta 1/-1
 * @param {Victor|undefined} zoomCoordinate If undefined we'll zoom to the center of visible range
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

Viewport.prototype.areBoundsInRange = function(bounds, contain) {
    return this.range.doBoundsIntersect(bounds, contain);
};

Viewport.prototype.isInYRange = function(y) {
    return this.range.isInYBounds(y);
};

Viewport.prototype.isInXRange = function(x) {
    return this.range.isInXBounds(x);
};

Viewport.prototype.isInRange = function(vec) {
    return this.range.isInBounds(vec);
};

// Give direct range access through pos,size,x,y,width,height
// accessors on the Viewport prototype
Bounds.defineAccess(Viewport.prototype, 'range');

// Attach some useful properties
Viewport.Bounds = Bounds;
Viewport.Victor = Victor;

exports = module.exports = Viewport;