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
	    // TODO: Actually needs to search for the correct sub-node?
        var index = this.findIndex(item);
        var node = this.nodes[index];

        // If the item fits nicely into this node bounds or is it 'stuck'
        if (node.doBoundsIntersect(item, true)) {
            node.insert(item);
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
 * Remove an item from this node (or traverse)
 * @param item
 */
BoundsNode.prototype.remove = function (item) {
    // If the item could be in a sub-node?
    if (this.nodes.length) {
        // Is it in stuck children?
        var stuckItemIndex = this._stuckChildren.indexOf(item);
        if (stuckItemIndex >= 0) {
            this._stuckChildren.splice(stuckItemIndex, 1);

            return;
        }

	    // TODO: Actually needs to search through multiple here
        var nodeIndex = this.findIndex(item.pos);
        this.nodes[nodeIndex].remove(item);

        return;
    }

    var itemIndex = this.children.indexOf(item);
    if (itemIndex >= 0) this.children.splice(itemIndex, 1);
};

/**
 * Retrieve children of this node (includes stuck children)
 * @returns {Array}
 */
BoundsNode.prototype.getChildren = function () {
    return this.children.concat(this._stuckChildren);
};

/**
 * Retrieve all children from nodes covered by given bounds
 * @param {Bounds} bounds
 * @returns {Array}
 */
BoundsNode.prototype.retrieve = function (bounds) {
    // Shall we search sub-nodes?
    if (this.nodes.length) {

        var out = this._stuckChildren;
        var indexes = this._searchIndexes(bounds);
        var numIndexes = indexes.length;
        for (var i = 0; i < numIndexes; i++)
            out = out.concat(this.nodes[indexes[i]].retrieve(bounds));

        return out;
    }

    return this.children;
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
    var topLeftIndex = this.findIndex(bounds.pos);

    var bottomRightIndex = this.findIndex(
	    bounds.pos.clone().add(bounds.size)
    );

    var indexes = [];
    for (var i = topLeftIndex; i <= bottomRightIndex; i++)
        indexes.push(i);

    return indexes;
};

exports = module.exports = BoundsNode;