var Victor = require('victor');
var Bounds = require('./bounds');

/**
 * 2d Viewport item
 * @param {Victor} pos Position vector
 * @param {Victor} size Size vector
 * @constructor
 * @augments Bounds
 */
var ViewportItem = Bounds.extendWithConstructor(function(pos, size) {
    // Call super
    Bounds.call(this, pos, size);

    /**
     * Z-indexing for 2d layering
     * @type {number}
     */
    this.z = 0;
});

exports = module.exports = ViewportItem;