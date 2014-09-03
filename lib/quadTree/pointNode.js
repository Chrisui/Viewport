var Constructr = require('constructr');
var Victor = require('victor');
var Bounds = require('../bounds');

/**
 * Construct a quad tree node which stores points
 * @param bounds {Bounds}
 * @param depth {Number}
 * @param maxDepth {Number}
 * @param maxChildren {Number}
 * @constructor
 */
var PointNode = Bounds.extendWithConstructor(function(bounds, depth, maxDepth, maxChildren) {
    // Call bounds constructor
    Bounds.call(this, bounds.pos, bounds.size);

    this.children = [];
    this.nodes = [];

    this._maxChildren = maxChildren;
    this._maxDepth = maxDepth;
    this._depth = depth || 0;
});

// Which quad eh?
PointNode.TOP_LEFT = 0;
PointNode.TOP_RIGHT = 1;
PointNode.BOTTOM_LEFT = 2;
PointNode.BOTTOM_RIGHT = 3;

/**
 * Insert an item into this node (and into appropiate sub node if applicable)
 * @param item Item must implement bounds interface
 */
PointNode.prototype.insert = function (item) {
    // If we have already sub-divided into child nodes
    if (this.nodes.length) {
        var nodeIndex = this._findIndex(item);
        this.nodes[nodeIndex].insert(item);

        return;
    }

    this.children.push(item);

    // Should we sub divide at this point?
    var len = this.children.length;
    if (this._depth < this._maxDepth && len > this._maxChildren) {
        this.subdivide();

        for (var i = 0; i < len; i++) this.insert(this.children[i]);

        this.children.length = 0;
    }
};

/**
 * Remove given item from this node
 * @param item
 */
PointNode.prototype.remove = function (item) {
    // If it could be in sub-nodes?
    if (this.nodes.length) {
        var nodeIndex = this._findIndex(item);
        this.nodes[nodeIndex].remove(item);

        return;
    }

    var itemIndex = this.children.indexOf(item);
    if (itemIndex >= 0) this.children.splice(itemIndex, 1);
};

/**
 * Retrieve all children from the node which satisfy search bounds
 * @param {Bounds} bounds
 * @returns {Array}
 */
PointNode.prototype.retrieve = function (bounds) {
    if (this.nodes.length) {
        var index = this._findIndex(bounds);

        return this.nodes[index].retrieve(bounds);
    }

    return this.children;
};

/**
 * Find which sub node index we would insert item with given bounds into
 * @param {Bounds} bounds
 * @returns {number}
 * @private
 */
PointNode.prototype._findIndex = function (bounds) {
    var left = bounds.x <= this.x + this.width / 2;
    var top = bounds.y <= this.y + this.height / 2;

    // Top left
    var index = Node.TOP_LEFT;
    if (left) {
        // Left side
        if (!top) {
            // Bottom left
            index = Node.BOTTOM_LEFT;
        }
    } else {
        // Right side
        if (top) {
            // Top right
            index = Node.TOP_RIGHT;
        } else {
            // Bottom right
            index = Node.BOTTOM_RIGHT;
        }
    }

    return index;
};

/**
 * Split this node into 4 sub nodes using bounds
 */
PointNode.prototype.subdivide = function () {
    var depth = this._depth + 1;
    var bx = this.x;
    var by = this.y;

    // Floor the values
    var b_w_h = (this.width / 2) | 0;
    var b_h_h = (this.height / 2) | 0;
    var bx_b_w_h = bx + b_w_h;
    var by_b_h_h = by + b_h_h;

    // Top left
    this.nodes[Node.TOP_LEFT] = new this.constructor(
        new Bounds(
            new Victor(bx, by),
            new Victor(b_w_h, b_h_h)
        ),
        depth
    );

    // Top right
    this.nodes[Node.TOP_RIGHT] = new this.constructor(
        new Bounds(
            new Victor(bx_b_w_h, by),
            new Victor(b_w_h, b_h_h)
        ),
        depth
    );

    // Bottom left
    this.nodes[Node.BOTTOM_LEFT] = new this.constructor(
        new Bounds(
            new Victor(bx, by_b_h_h),
            new Victor(b_w_h, b_h_h)
        ),
        depth
    );


    // Bottom right
    this.nodes[Node.BOTTOM_RIGHT] = new this.constructor(
        new Bounds(
            new Victor(bx_b_w_h, by_b_h_h),
            new Victor(b_w_h, b_h_h)
        ),
        depth
    );
};

/**
 * Clear all children (and traverse down sub nodes)
 */
PointNode.prototype.clear = function () {
    this.children.length = 0;

    var len = this.nodes.length;
    for (var i = 0; i < len; i++) {
        this.nodes[i].clear();
    }

    this.nodes.length = 0;
};

/**
 * Retrieve children of this node
 * @returns {Array}
 */
PointNode.prototype.getChildren = function () {
    return this.children;
};

exports = module.exports = PointNode;