var Constructr = require('constructr');
var Bounds = require('./bounds');
var QuadTree = require('./quadTree');
var Item = require('./item');
/**
 * 2d Viewport manager
 * @param {Viewport} viewport The viewport to manage
 * @constructor
 *
 * TODO: Add grid indexing
 * TODO: Add axis indexing
 */
var ViewportManager = Constructr(function(viewport) {

    /**
     * The viewport this manager is currently managing
     * @type {Viewport}
     */
    this.viewport = viewport;

    /**
     * Collection of managed items
     * @type {Array}
     */
    this.items = [];

    /**
     * Should we index items in a quad tree?
     * @type {boolean}
     */
    this.doIndex = true;

    /**
     * Current index instance
     * @type {QuadTree}
     */
    this.index = new QuadTree(viewport.cloneBounds());

    /**
     * Cached highest z index
     * @type {number}
     */
    this.topZ = 0;
});

/**
 * Is given item (or any bounds) in viewport range?
 * @param {Bounds} bounds
 * @param {Boolean} [contained] true = check for entirity of bounds
 * @return {Boolean}
 */
ViewportManager.prototype.isVisible = function(bounds, contained) {
    return this.viewport.doBoundsIntersect(bounds, contained);
};

/**
 * Add an item to be managed by this viewport
 * @param {Item} item
 */
ViewportManager.prototype.addItem = function(item) {
    this.items.push(item);

    if (this.doIndex) this.index.insert(item);
};

/**
 * Remove an item from the viewport
 * @param {Item} item
 */
ViewportManager.prototype.removeItem = function(item) {
    var index = this.items.indexOf(item);

    if (index >= 0) this.items.splice(index, 1);

    if (this.doIndex) this.index.remove(item);
};

/**
 * Clear this manager of items
 */
ViewportManager.prototype.clearItems = function() {
    this.items.length = 0;
    this.index.clear();
};

/**
 * Given bounds, find intersecting items
 * @param {Bounds} bounds
 * @param {Boolean} [contained] IF TRUE then we make sure the entire item is in bounds
 * @returns {*}
 */
ViewportManager.prototype.findItems = function(bounds, contained) {
    var items = [];
    var looseItems = this.doIndex ? this.index.retrieve(bounds) : this.items;
    var numLooseItems = looseItems.length;

    // Check for exact matches
    for (var i = 0; i < numLooseItems; ++i)
        if (this.viewport.doBoundsIntersect(looseItems[i], contained))
            items.push(looseItems[i]);

    return items;
};

/**
 * Focus our viewport around so our array of items are all visible
 * TODO: Have option to maintain aspect ratio
 * @param {Item[]} [items] Defaults to all items
 */
ViewportManager.prototype.focusItems = function(items) {
    items = items || this.items;

    this.focus(
        Bounds.fromBoundsArray(items)
    );
};

/**
 * Focus viewport on given bounds
 * TODO: Have option to maintain aspect ratio
 * @param {Bounds} bounds
 */
ViewportManager.prototype.focus = function(bounds) {

    // TODO: Check delta ratio of the range mutation we're making and adjust each axis with the lesser delta ratio so to keep aspect ratio

    this.viewport.copyBounds(bounds);

    // viewPerPlotSpace will now be invalid
    this.viewport.invalidate();
};

/**
 * Resize managed viewport with an anchor (VIEW SPACE)
 * @param {Victor} size Size vector in view space
 * @param {Number} anchor See Bounds.ANCHORS
 */
ViewportManager.prototype.resize = function(size, anchor) {
    this.viewport.resize(
        this.viewport.viewToPlotSpace(size, true),
        anchor
    );
    this.viewport.viewSpace.resize(size, anchor);

    // viewPerPlotSpace will now be invalid
    this.viewport.invalidate();
};

/**
 * Move the viewport by panDelta (plot space) and handles updating indexing etc.
 * NOTE: Panning makes the assumption that you never want your view distorted
 *       and that the range is smaller than the range limits in the first place.
 *       Ie. We will just take the first clamp we hit (min or max end) to prevent
 *       further movement and not squeeze.
 * @param {Victor} panDelta Delta vector (plot space)
 */
ViewportManager.prototype.pan = function(panDelta) {
    this.viewport.pan(panDelta);

    //if (this.doIndex) this.index.setBounds(this.viewport);
};

/**
 * Zoom on a point. Pass basicDelta and optionally zoomCoordinate (plot space)
 * @param {Number} basicDelta 1/-1
 * @param {Victor} [zoomCoordinate] If undefined we'll zoom to the center of visible range
 */
ViewportManager.prototype.zoom = function(basicDelta, zoomCoordinate) {
    this.viewport.zoom(basicDelta, zoomCoordinate);
};

exports = module.exports = ViewportManager;