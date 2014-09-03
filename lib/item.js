var Victor = require('victor');
var Bounds = require('./bounds');

/**
 * 2d Viewport item
 * @param {Victor} pos Position vector
 * @param {Victor} size Size vector
 * @constructor
 * @augments Bounds
 */
var Item = Bounds.extendWithConstructor(function(pos, size) {
    // Call super
    Bounds.call(this, pos, size);
});

exports = module.exports = Item;