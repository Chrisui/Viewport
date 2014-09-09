var Constructr = require('constructr');
var Victor = require('victor');

/**
 * Bounds object
 * @param {Victor} pos
 * @param {Victor} size
 * @constructor
 */
var Bounds = Constructr(function(pos, size) {

	/**
	 * Position vector
	 * @type {Victor}
	 */
    this.pos = pos || new Victor(0,0);

	/**
	 * Size vector (x=w, y=h)
	 * @type {Victor}
	 */
    this.size = size || new Victor(0,0);

});

/**
 * Anchor consts
 * @constant
 * @type {{TOPLEFT: number, TOPRIGHT: number, BOTTOMRIGHT: number, BOTTOMLEFT: number}}
 */
Bounds.ANCHORS = {
    TOPLEFT: 0,
    TOPRIGHT: 1,
    BOTTOMRIGHT: 2,
    BOTTOMLEFT: 3
};

/**
 * Construct method from object
 * @param {Object} obj "{x:x, y:y, width:w, height:h}"
 * @static
 * @return {Bounds}
 */
Bounds.fromObject = function(obj) {
    return new Bounds(new Victor(obj.x, obj.y), new Victor(obj.width, obj.height));
};

/**
 * Construct method from a 2d array
 * @param {Array} arr 2d Array "[[x,y],[w,h]]"
 * @static
 * @return {Bounds}
 */
Bounds.from2dArray = function(arr) {
    return new Bounds(Victor.fromArray(arr[0]), Victor.fromArray(arr[1]));
};

/**
 * Construct method from a 4 element array
 * @param {Array} arr "[x,y,w,h]"
 * @static
 * @return {Bounds}
 */
Bounds.fromArray = function(arr) {
    return new Bounds(new Victor(arr[0], arr[1]), new Victor(arr[2], arr[3]));
};

/**
 * Construct method from 2 pos/size arrays
 * @param {Array} pos "[x,y]"
 * @param {Array} size "[w,h]"
 * @static
 * @return {Bounds}
 */
Bounds.fromArrays = function(pos, size) {
    return new Bounds(Victor.fromArray(pos), Victor.fromArray(size));
};

/**
 * Given an array of bounds objects, build a box around them
 * @param {Bounds[]} boundsArr array
 * @return {Bounds}
 * @static
 */
Bounds.fromBoundsArray = function(boundsArr) {
    var boundsObj = {
        x: null,
        y: null,
        width: null,
        height: null
    };

    // Loop over all the viewport items calculating a min/max required range
    var numBounds = boundsArr.length;
    for (var i = 0; i < numBounds; ++i) {
        var bounds = boundsArr[i];

        if (boundsObj.x === null || bounds.x < x) boundsObj.x = bounds.x;
        if (boundsObj.width === null || bounds.xMax > xMax) boundsObj.width = bounds.width;
        if (boundsObj.y === null || bounds.y < y) boundsObj.y = bounds.y;
        if (boundsObj.height === null || bounds.yMax > yMax) boundsObj.height = bounds.height;
    }

    return Bounds.fromObject(bounds);
};

/**
 * Util method to return bounds string representation
 * @return {String}
 */
Bounds.prototype.toString = function() {
    return 'x: ' + this.x + ', y:' + this.y + ', w: ' + this.width + ', h:' + this.height;
};

/**
 * Util method to return bounds object representation
 * @return {Object}
 */
Bounds.prototype.toObject = function() {
    return {x: this.x, y: this.y, width: this.width, height: this.height};
};

/**
 * Util method to return bounds array representation
 * @return {Array}
 */
Bounds.prototype.toArray = function() {
    return [this.x, this.y, this.width, this.height];
};

/**
 * Util method to return bounds array representation
 * @return {Array}
 */
Bounds.prototype.to2dArray = function() {
    return [this.pos.toArray(), this.size.toArray()];
};

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
 * @param {Boolean} [contained] Shall we make sure the bounds are entirely in range?
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

/**
 * Return a new bounds copy with these values
 * @return {Bounds}
 */
Bounds.prototype.cloneBounds = function() {
    return new Bounds(
        new Victor(this.x, this.y),
        new Victor(this.width, this.height)
    );
};

/**
 * Copy values from a bounds object into this one
 * @param {Bounds} bounds
 */
Bounds.prototype.copyBounds = function(bounds) {
    this.pos.x = bounds.pos.x;
    this.pos.y = bounds.pos.y;
    this.size.x = bounds.size.x;
    this.size.y = bounds.size.y;
};

/**
 * Resize bounds with an anchor
 * @param {Victor} size Size vector
 * @param {Number} anchor See Bounds.ANCHORS
 */
Bounds.prototype.resize = function(size, anchor) {

    switch (anchor) {
        case Bounds.ANCHORS.TOPRIGHT:
            this.size.copyY(size);
            this.pos.x = this.xMax - size.x;

            break;

        case Bounds.ANCHORS.BOTTOMRIGHT:
            this.pos.x = this.xMax - size.x;
            this.pos.y = this.yMax - size.y;

            break;

        case Bounds.ANCHORS.BOTTOMLEFT:
            this.size.copyX(size);
            this.pos.y = this.yMax - size.y;

            break;

        case Bounds.ANCHORS.TOPLEFT:
        default:
            this.size.copy(size);

            break;
    }

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