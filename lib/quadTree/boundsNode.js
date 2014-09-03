var Victor = require('victor');
var Bounds = require('../bounds');
var PointNode = require('./pointNode');

/**
 * Create a quad tree node which stores bounds
 * @param bounds {Bounds}
 * @param depth {Number}
 * @param maxDepth {Number}
 * @param maxChildren {Number}
 * @constructor
 * @augments PointNode
 */
var BoundsNode = PointNode.extendWithConstructor(function(bounds, depth, maxChildren, maxDepth) {
    // Call super construct function
    PointNode.call(this, bounds, depth, maxChildren, maxDepth);

    // Children which don't belong anywhere specific
    this._stuckChildren = [];
});

/**
 * Insert an item into this node (and into appropiate sub node if applicable)
 * @param item Item must implement bounds interface (mininmal x,y)
 */
BoundsNode.prototype.insert = function (item) {
    // If we have already sub-divided into child nodes
    if (this.nodes.length) {
        var index = this._findIndex(item);
        var node = this.nodes[index];

        // If the node fits nicely into this node bounds or is it 'stuck'
        if (item.x >= node.x &&
            item.x + item.width <= node.x + node.width &&
            item.y >= node.y &&
            item.y + item.height <= node.y + node.height) {
            this.nodes[index].insert(item);
        } else {
            this._stuckChildren.push(item);
        }

        return;
    }

    this.children.push(item);

    // Is it time to start sub dividing into child nodes yet?
    var len = this.children.length;
    if (this._depth < this._maxDepth && len > this._maxChildren) {
        this.subdivide();

        for (var i = 0; i < len; i++)
            this.insert(this.children[i]);

        this.children.length = 0;
    }
};

/**
 * Retrieve children of this node (includes stuck children)
 * @returns {Array}
 */
BoundsNode.prototype.getChildren = function () {
    return this.children.concat(this._stuckChildren);
};

/**
 * Retrieve all children from the node of a given item
 * @param item
 * @returns {Array}
 */
BoundsNode.prototype.retrieve = function (item) {
    var out = [];

    if (this.nodes.length) {
        // As we are searching within a box we will want an array of quad nodes to search
        var indexes = this._searchIndexes(item);
        var numIndexes = indexes.length;
        for (var i = 0; i < numIndexes; i++)
            out = out.concat(this.nodes[indexes[i]].retrieve(item));
    }

    out = out.concat(this._stuckChildren);
    out = out.concat(this.children);

    return out;
};

/**
 * Clear children, nodes and traverse
 */
BoundsNode.prototype.clear = function () {
    this._stuckChildren.length = 0;
    this.children.length = 0;

    var len = this.nodes.length;
    if (!len) return;

    for (var i = 0; i < len; i++)
        this.nodes[i].clear();

    this.nodes.length = 0;
};

/**
 * Try finding an appropiate choice of indexes to store an item depending on given bounds
 * @param {Bounds} bounds
 * @returns {Array}
 * @private
 */
BoundsNode.prototype._searchIndexes = function (bounds) {
    var topLeftIndex = this._findIndex({
        x: bounds.x,
        y: bounds.y
    });

    var bottomRightIndex = this._findIndex({
        x: bounds.xMax,
        y: bounds.yMax
    });

    var indexes = [];
    for (var i = topLeftIndex; i <= bottomRightIndex; i++)
        indexes.push(i);

    return indexes;
};

exports = module.exports = BoundsNode;