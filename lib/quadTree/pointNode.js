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
var PointNode = function(bounds, depth, maxDepth, maxChildren) {
    this._bounds = bounds;
    this.children = [];
    this.nodes = [];

    this._maxChildren = maxChildren;
    this._maxDepth = maxDepth;
    this._depth = depth || 0;
};

// Constructor for sub nodes
PointNode.prototype._classConstructor = PointNode;

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
    // If we have started sub-dividing
    if (this.nodes.length) {
        var index = this._findIndex(item);
        this.nodes[index].insert(item);

        return;
    }

    this.children.push(item);

    // Should we sub divide at this point?
    var len = this.children.length;
    if (!(this._depth >= this._maxDepth) && len > this._maxChildren) {
        this.subdivide();

        for (var i = 0; i < len; i++) this.insert(this.children[i]);

        this.children.length = 0;
    }
};

/**
 * Update bounds
 * @param {Bounds} bounds
 */
PointNode.prototype.setBounds = function(bounds) {
    this._bounds = bounds;
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
    var b = this._bounds;
    var left = bounds.x <= b.x + b.width / 2;
    var top = bounds.y <= b.y + b.height / 2;

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
    var bx = this._bounds.x;
    var by = this._bounds.y;

    // Floor the values
    var b_w_h = (this._bounds.width / 2) | 0;
    var b_h_h = (this._bounds.height / 2) | 0;
    var bx_b_w_h = bx + b_w_h;
    var by_b_h_h = by + b_h_h;

    // Top left
    this.nodes[Node.TOP_LEFT] = new this._classConstructor({
        x       : bx,
        y       : by,
        width   : b_w_h,
        height  : b_h_h
    }, depth);

    // Top right
    this.nodes[Node.TOP_RIGHT] = new this._classConstructor({
        x       : bx_b_w_h,
        y       : by,
        width   : b_w_h,
        height  : b_h_h
    }, depth);

    // Bottom left
    this.nodes[Node.BOTTOM_LEFT] = new this._classConstructor({
        x       : bx,
        y       : by_b_h_h,
        width   : b_w_h,
        height  : b_h_h
    }, depth);


    // Bottom right
    this.nodes[Node.BOTTOM_RIGHT] = new this._classConstructor({
        x       : bx_b_w_h,
        y       : by_b_h_h,
        width   : b_w_h,
        height  : b_h_h
    }, depth);
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