var Item = require('../lib/item');
var Bounds = require('../lib/bounds');
var Victor = require('victor');
var expect = require('chai').expect;

// Define some test constants
var INITIAL_BOUNDS_POSITION = [0,0];
var INITIAL_BOUNDS_SIZE = [500,200];

describe('Item', function() {

    var item;

    beforeEach(function() {
        item = new Item(
            Victor.fromArray(INITIAL_BOUNDS_POSITION),
            Victor.fromArray(INITIAL_BOUNDS_SIZE)
        );
    });

    describe('constructor', function() {

        it('should inherit from bounds', function() {
            expect(item).to.be.instanceOf(Bounds);
            // With correct accessors through viewport prototype
            expect(item.x).to.equal(INITIAL_BOUNDS_POSITION[0]);
            expect(item.y).to.equal(INITIAL_BOUNDS_POSITION[1]);
            expect(item.width).to.equal(INITIAL_BOUNDS_SIZE[0]);
            expect(item.height).to.equal(INITIAL_BOUNDS_SIZE[1]);
        });

    });

});