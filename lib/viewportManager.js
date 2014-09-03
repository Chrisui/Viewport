var Constructr = require('constructr');
var Bounds = require('./bounds');
var QuadTree = require('./quadTree');
var Item = require('./item');

/**
 * 2d Viewport manager
 * @param {Viewport} viewport The viewport to manage
 * @constructor
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

    var newRange = Bounds.fromBoundsArray(items);
    this.viewport.copyBounds(newRange);
};

exports = module.exports = ViewportManager;