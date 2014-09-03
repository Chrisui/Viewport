var Victor = require('victor');
var Bounds = require('./bounds');
var BoundsNode = require('./quadTree/boundsNode');
var PointNode = require('./quadTree/pointNode');

/**
 * Construct a quad tree (bounds nodes by default)
 * @param {Bounds} bounds
 * @param {true|false} pointQuad Defaults to false
 * @param {Number|undefined} maxDepth Defaults to 4
 * @param {Number|undefined} maxChildren Defaults to 4
 * @constructor
 */
var QuadTree = function(bounds, pointQuad, maxDepth, maxChildren) {
    maxChildren = maxChildren || 4;
    maxDepth = maxDepth || 4;

    this.root = pointQuad
        ? new PointNode(bounds, 0, maxDepth, maxChildren)
        : new BoundsNode(bounds, 0, maxDepth, maxChildren);
};

/**
 * Update root node bounds
 * @param {Bounds} bounds
 */
QuadTree.prototype.setBounds = function(bounds) {
    this.root.setBounds(bounds);
};

/**
 * Inserts an item into the QuadTree.
 * @param {Array|Bounds} item Insert a single item or array of items into the tree - this item/s must implement the Bounds interface
 */
QuadTree.prototype.insert = function (item) {
    if (typeof item === 'array') {
        var len = item.length;
        for (var i = 0; i < len; ++i)
            this.root.insert(item[i]);

        return
    }

    this.root.insert(item);
};

/**
 * Clears all nodes and children from the QuadTree
 */
QuadTree.prototype.clear = function () {
    this.root.clear();
};

/**
 * Retrieves all items/points in the same node as the specified bounds/point.
 * NOTE: Returns a copy of array
 * @param {Bounds} Bounds describing where to search
 */
QuadTree.prototype.retrieve = function (bounds) {
    return this.root.retrieve(item).slice(0);
};

exports = module.exports = QuadTree;