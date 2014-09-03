var Bounds = require('../lib/bounds');
var Victor = require('victor');
var expect = require('chai').expect;

// Define some test constants
var INITIAL_BOUNDS_POSITION = [0,0];
var INITIAL_BOUNDS_SIZE = [500,200];

describe('Bounds', function() {

    var b;

    beforeEach(function() {
        b = new Bounds(
            Victor.fromArray(INITIAL_BOUNDS_POSITION),
            Victor.fromArray(INITIAL_BOUNDS_SIZE)
        );
    });

    describe('.isInBounds()', function() {

        it('should preach the truth', function() {
            expect(b.isInBounds(new Victor(100, 100))).to.be.true;
            expect(b.isInBounds(new Victor(9999999, 100))).to.be.false;
            expect(b.isInBounds(new Victor(9999999, 9999999999999))).to.be.false;
        });

    });

    describe('.isInXBounds()', function() {

        it('should preach the truth', function() {
            expect(b.isInXBounds(100)).to.be.true;
            expect(b.isInXBounds(99999999)).to.be.false;
        });

    });

    describe('.isInYBounds()', function() {

        it('should preach the truth', function() {
            expect(b.isInYBounds(100)).to.be.true;
            expect(b.isInYBounds(99999999)).to.be.false;
        });

    });

    describe('.doBoundsIntersect()', function() {

        it('should return true for box entirely in range', function() {
            var bounds = new Bounds(
                new Victor(50,50),
                new Victor(50,50)
            );
            expect(b.doBoundsIntersect(bounds)).to.be.true;
            expect(b.doBoundsIntersect(bounds, true)).to.be.true;
        });

        it('should return correct values for different checks on overlapping bounds', function() {
            var bounds = new Bounds(
                new Victor(-25,-25),
                new Victor(50,50)
            );
            expect(b.doBoundsIntersect(bounds)).to.be.true;
            expect(b.doBoundsIntersect(bounds, true)).to.be.false;
        });

        it('should return true for massive bounds greater than all range axis dimensions', function() {
            var bounds = new Bounds(
                new Victor(-25,-25),
                new Victor(999999,9999999)
            );
            expect(b.doBoundsIntersect(bounds)).to.be.true;
            expect(b.doBoundsIntersect(bounds, true)).to.be.false;
        });

    });

});