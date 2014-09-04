var Viewport = require('../lib/viewport');
var Bounds = require('../lib/bounds');
var Victor = require('victor');
var expect = require('chai').expect;

// Define some test constants
var INITIAL_BOUNDS_POSITION = [0,0];
var INITIAL_BOUNDS_SIZE = [500,200];
var INITIAL_VIEW_POSITION = [0,0];
var INITIAL_VIEW_SIZE = [1000,400];

describe('Viewport', function() {

    var vp;

    beforeEach(function() {
        vp = new Viewport(
            Victor.fromArray(INITIAL_BOUNDS_POSITION),
            Victor.fromArray(INITIAL_BOUNDS_SIZE),
            new Bounds(
                Victor.fromArray(INITIAL_VIEW_POSITION),
                Victor.fromArray(INITIAL_VIEW_SIZE)
            )
        );
    });

    describe('constructor', function() {

        it('should inherit from bounds', function() {
            expect(vp).to.be.instanceOf(Bounds);
            // With correct accessors through viewport prototype
            expect(vp.x).to.equal(INITIAL_BOUNDS_POSITION[0]);
            expect(vp.y).to.equal(INITIAL_BOUNDS_POSITION[1]);
            expect(vp.width).to.equal(INITIAL_BOUNDS_SIZE[0]);
            expect(vp.height).to.equal(INITIAL_BOUNDS_SIZE[1]);
        });

    });

    describe('.getViewPerPlotSpace()', function() {

        it('should provide the correct values', function() {
            expect(vp.getViewPerPlotSpace()).to.have.property('x', 2);
            expect(vp.getViewPerPlotSpace()).to.have.property('y', 2);
        });

        it('should cache the value until invalidated', function() {
            expect(vp.getViewPerPlotSpace()).to.have.property('x', 2);
            expect(vp.getViewPerPlotSpace()).to.have.property('y', 2);

            vp.size.x = INITIAL_BOUNDS_SIZE[0] * 2;
            vp.size.y = INITIAL_BOUNDS_SIZE[1] * 2;

            expect(vp.getViewPerPlotSpace()).to.have.property('x', 2);
            expect(vp.getViewPerPlotSpace()).to.have.property('y', 2);

            vp.invalidate();

            expect(vp.getViewPerPlotSpace()).to.have.property('x', 1);
            expect(vp.getViewPerPlotSpace()).to.have.property('y', 1);
        });

    });

    describe('.plotToViewSpace()', function() {

        var ret, vec;

        beforeEach(function() {
            vec = new Victor(50, 50);
            ret = vp.plotToViewSpace(vec);
        });

        it('should return a victor vector', function() {
            expect(ret).to.be.instanceOf(Victor);
        });

        it('should not have modified the passed vector', function() {
            expect(ret).to.not.equal(vec);
        });

        it('should provide the correct values', function() {
            expect(ret).to.have.property('x', 100);
            expect(ret).to.have.property('y', 100);
        });

    });

    describe('.plotToClientSpace()', function() {

        var ret, vec;

        beforeEach(function() {
            vec = new Victor(50, 50);
            ret = vp.plotToClientSpace(vec);
        });

        it('should return a victor vector', function() {
            expect(ret).to.be.instanceOf(Victor);
        });

        it('should not have modified the passed vector', function() {
            expect(ret).to.not.equal(vec);
        });

        it('should provide the correct values', function() {
            expect(ret).to.have.property('x', 100);
            expect(ret).to.have.property('y', 100);

            // Now try with viewport offset
            vp.viewBounds.pos.x = 50;
            vp.viewBounds.pos.y = 50;
            ret = vp.plotToClientSpace(vec);

            expect(ret).to.have.property('x', 150);
            expect(ret).to.have.property('y', 150);
        });

    });

    describe('.viewToPlotSpace()', function() {

        var ret, vec;

        beforeEach(function() {
            vec = new Victor(50, 50);
            ret = vp.viewToPlotSpace(vec);
        });

        it('should return a victor vector', function() {
            expect(ret).to.be.instanceOf(Victor);
        });

        it('should not have modified the passed vector', function() {
            expect(ret).to.not.equal(vec);
        });

        it('should provide the correct values', function() {
            expect(ret).to.have.property('x', 25);
            expect(ret).to.have.property('y', 25);
        });

    });

    describe('.viewToClientSpace()', function() {

        var ret, vec;

        beforeEach(function() {
            vec = new Victor(50, 50);
            ret = vp.viewToClientSpace(vec);
        });

        it('should return a victor vector', function() {
            expect(ret).to.be.instanceOf(Victor);
        });

        it('should not have modified the passed vector', function() {
            expect(ret).to.not.equal(vec);
        });

        it('should provide the correct values', function() {
            expect(ret).to.have.property('x', 50);
            expect(ret).to.have.property('y', 50);

            // Now try with viewport offset
            vp.viewBounds.pos.x = 50;
            vp.viewBounds.pos.y = 50;
            ret = vp.viewToClientSpace(vec);

            expect(ret).to.have.property('x', 100);
            expect(ret).to.have.property('y', 100);
        });

    });

    describe('.clientToViewSpace()', function() {

        var ret, vec;

        beforeEach(function() {
            vec = new Victor(50, 50);
            ret = vp.clientToViewSpace(vec);
        });

        it('should return a victor vector', function() {
            expect(ret).to.be.instanceOf(Victor);
        });

        it('should not have modified the passed vector', function() {
            expect(ret).to.not.equal(vec);
        });

        it('should provide the correct values', function() {
            expect(ret).to.have.property('x', 50);
            expect(ret).to.have.property('y', 50);

            // Now try with viewport offset
            vp.viewBounds.pos.x = 50;
            vp.viewBounds.pos.y = 50;
            ret = vp.clientToViewSpace(vec);

            expect(ret).to.have.property('x', 0);
            expect(ret).to.have.property('y', 0);
        });

    });

    describe('.clientToPlotSpace()', function() {

        var ret, vec;

        beforeEach(function() {
            vec = new Victor(50, 50);
            ret = vp.clientToPlotSpace(vec);
        });

        it('should return a victor vector', function() {
            expect(ret).to.be.instanceOf(Victor);
        });

        it('should not have modified the passed vector', function() {
            expect(ret).to.not.equal(vec);
        });

        it('should provide the correct values', function() {
            expect(ret).to.have.property('x', 25);
            expect(ret).to.have.property('y', 25);

            // Now try with viewport offset
            vp.viewBounds.pos.x = 50;
            vp.viewBounds.pos.y = 50;
            ret = vp.clientToPlotSpace(vec);

            expect(ret).to.have.property('x', 0);
            expect(ret).to.have.property('y', 0);

            // And again with new coord
            vec = new Victor(200, 200);
            vp.viewBounds.pos.x = 50;
            vp.viewBounds.pos.y = 50;
            ret = vp.clientToPlotSpace(vec);

            expect(ret).to.have.property('x', 75);
            expect(ret).to.have.property('y', 75);
        });

    });

    describe('.pan()', function() {

        it('should shift the range accordingly and not affect size', function() {
            vp.pan(new Victor(200, 500));
            expect(vp).to.have.property('x', 200);
            expect(vp).to.have.property('y', 500);
        });

        it('should obey range limits', function() {
            vp.rangeLimits.size.x = 2000;
            vp.rangeLimits.size.y = 2000;

            vp.pan(new Victor(-200, -500));
            expect(vp).to.have.property('x', 0);
            expect(vp).to.have.property('y', 0);

            vp.pan(new Victor(9000, 0));
            expect(vp).to.have.property('x', 1500);
            expect(vp).to.have.property('y', 0);
        });

    });

    describe('.zoom()', function() {

        it('should zoom by default around the center of range', function() {
            vp.zoom(1);

            expect(vp).to.have.property('x', 125);
            expect(vp).to.have.property('y', 50);
            expect(vp).to.have.property('width', 250);
            expect(vp).to.have.property('height', 100);

            // And zoom back out again
            vp.zoom(-1);
            vp.zoom(-1);

            expect(vp).to.have.property('x', -250);
            expect(vp).to.have.property('y', -100);
            expect(vp).to.have.property('width', 1000);
            expect(vp).to.have.property('height', 400);
        });

        it('should zoom correctly around a given point', function() {
            var zoomPoint = new Victor(125, 50); // 25% of each default axis range

            vp.zoom(1, zoomPoint);

            expect(vp).to.have.property('x', 62.5);
            expect(vp).to.have.property('y', 25);
            expect(vp).to.have.property('width', 250);
            expect(vp).to.have.property('height', 100);

            // And zoom back out again
            vp.zoom(-1, zoomPoint);
            vp.zoom(-1, zoomPoint);

            expect(vp).to.have.property('x', -125);
            expect(vp).to.have.property('y', -50);
            expect(vp).to.have.property('width', 1000);
            expect(vp).to.have.property('height', 400);
        });

    });

});