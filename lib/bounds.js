var Constructr = require('constructr');
var Victor = require('victor');

/**
 * Bounds object
 * @param {Victor} pos
 * @param {Victor} size
 * @constructor
 */
var Bounds = Constructr(function(pos, size) {
    this.pos    = pos   || new Victor(0,0);
    this.size   = size  || new Victor(0,0);
});

/**
 * Does this bounds box have size? >0 width or height
 */
Bounds.prototype.hasSize = function () {
    return this.size.x > 0 || this.size.y > 0;
};

/**
 * Check if a value is in current bounds on the x axis (plot space)
 * @return {Boolean}
 */
Bounds.prototype.isInXBounds = function(x) {
    return x <= this.xMax && x >= this.x;
};

/**
 * Check if a value is in current bounds on the y axis (plot space)
 * @return {Boolean}
 */
Bounds.prototype.isInYBounds = function(y) {
    return y <= this.yMax && y >= this.y;
};

/**
 * Is given vector in current bounds?
 * @param {Victor} vec Vector to check
 * @return {Boolean}
 */
Bounds.prototype.isInBounds = function(vec) {
    return this.isInXBounds(vec.x) && this.isInYBounds(vec.y);
};

/**
 * Do the given bounds (box) cross our current bounds OR entirely contained?
 * @param {Bounds} bounds Vector to check
 * @param {true|undefined} contained Shall we make sure the bounds are entirely in range?
 * @return {Boolean}
 */
Bounds.prototype.doBoundsIntersect = function(bounds, contained) {
    if (contained)
        return this.isInBounds(bounds.pos)
            && this.isInXBounds(bounds.xMax)
            && this.isInYBounds(bounds.yMax);

    return bounds.x < this.xMax
        && bounds.xMax > this.x
        && bounds.y < this.yMax
        && bounds.yMax > this.y;
};

Object.defineProperty(Bounds.prototype, 'x', {
    get: function () { return this.pos.x; },
    set: function (val) { this.pos.x = val; }
});

Object.defineProperty(Bounds.prototype, 'y', {
    get: function () { return this.pos.y; },
    set: function (val) { this.pos.y = val; }
});

Object.defineProperty(Bounds.prototype, 'width', {
    get: function () { return this.size.x; },
    set: function (val) { this.size.x = val; }
});

Object.defineProperty(Bounds.prototype, 'height', {
    get: function () { return this.size.y; },
    set: function (val) { this.size.y = val; }
});

Object.defineProperty(Bounds.prototype, 'xMax', {
    get: function () { return this.pos.x + this.size.x; },
    set: function (val) { this.size.x = val - this.size.x; }
});

Object.defineProperty(Bounds.prototype, 'yMax', {
    get: function () { return this.pos.y + this.size.y; },
    set: function (val) { this.size.y = val - this.size.y; }
});

exports = module.exports = Bounds;