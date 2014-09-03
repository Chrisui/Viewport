var QuadTree = require('../lib/quadTree');
var PointNode = require('../lib/quadTree/pointNode');
var BoundsNode = require('../lib/quadTree/boundsNode');
var Bounds = require('../lib/bounds');
var expect = require('chai').expect;

describe('QuadTree', function() {

    var TestItem = Bounds.extend();
    var qt, pn, bn;

    describe('constructor', function() {

        it('should create a root node of correct type', function() {
            qt = new QuadTree(new Bounds);
            expect(qt.root).to.be.instanceOf(BoundsNode);

            qt = new QuadTree(new Bounds, true);
            expect(qt.root).to.be.instanceOf(PointNode);
        });

    });

    describe('QuadTree/PointNode', function() {

        beforeEach(function() {
            pn = new PointNode(new Bounds);
        });

        describe('constructor', function() {

            it ('should inherit from Bounds', function() {
                expect(pn).to.be.instanceOf(Bounds);
            })

        });

    });

    describe('QuadTree/BoundsNode', function() {

        beforeEach(function() {
            bn = new BoundsNode(new Bounds);
        });

        describe('constructor', function() {

            it ('should inherit from PointNode', function() {
                expect(bn).to.be.instanceOf(PointNode);
            })

        });

    });

});