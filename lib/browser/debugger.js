var Constructr = require('constructr');
var Bounds = require('../bounds');
var requestAnimFrame = require('./requestAnimFrame');
/**
 * A visual debugger using canvas
 * NOTE: Meant for use in the browser
 * @param {Node} container Element in the dom to contain our debugger
 * @param {ViewportManager} viewportManager The viewportManager instance we want to debug
 * @constructor
 */
var Debugger = Constructr(function(container, viewportManager) {

    /**
     * Containing element for the debugger
     * @type {Element}
     */
    this.container = container;

    /**
     * Canvas element
     * @type {HTMLCanvasElement}
     */
    this.canvas = document.createElement('canvas');
    this.container.appendChild(this.canvas);

    /**
     * 2d context from canvas
     * @type {CanvasRenderingContext2D}
     */
    this.ctx = this.canvas.getContext('2d');

    /**
     * The viewportManager instance we want to debug
     * @type {ViewportManager}
     */
    this.viewportManager = viewportManager;

    /**
     * Direct reference to the viewport we are debugging
     * @type {Viewport}
     */
    this.viewport = viewportManager.viewport;

    /**
     * Do we need to do a full render pass?
     * @type {boolean}
     */
    this.stale = true;

    // First update the debugger size then kick render loop off
    this.updateSize();
    this.runRenderUpdate();
});

/**
 * Invalidate the debugger
 */
Debugger.prototype.invalidate = function() {
    this.stale = true;
};

/**
 * Tell the debugger to update its size to match the viewport
 */
Debugger.prototype.updateSize = function() {
	var pixelRatio = window.devicePixelRatio || 1;

    this.container.style.width = this.viewport.viewSpace.width + 'px';
    this.container.style.height = this.viewport.viewSpace.height + 'px';

    this.canvas.style.width = this.viewport.viewSpace.width + 'px';
    this.canvas.style.height = this.viewport.viewSpace.height + 'px';

    this.canvas.width = this.viewport.viewSpace.width * pixelRatio;
    this.canvas.height = this.viewport.viewSpace.height * pixelRatio;

	this.ctx.scale(pixelRatio, pixelRatio);

    this.invalidate();
};

/**
 * Kick off the render update loop
 */
Debugger.prototype.runRenderUpdate = function() {
    if (this.stale) this.render();
    requestAnimFrame(this.runRenderUpdate.bind(this));
};

/**
 * Render everything onto the canvas
 */
Debugger.prototype.render = function() {
    var width = this.viewport.viewSpace.width;
    var height = this.viewport.viewSpace.height;
    this.ctx.clearRect(0, 0, width, height);

    this.renderQuadTree();
    this.renderRange();
    this.renderItems();
};

/**
 * Render the quad tree index
 */
Debugger.prototype.renderQuadTree = function() {
    if (!this.viewportManager.doIndex) return;

    var tree = this.viewportManager.index;
    var context = this.ctx;
    var viewport = this.viewport;

    context.lineWidth = 1;

    var drawNode = function(node) {
        var viewBounds = viewport.plotToViewSpaceBounds(node);
        context.strokeStyle = '#bb00ff'; // Draw bounds boxes purple
        context.strokeRect(
	        Math.round(viewBounds.x)+0.5,
	        Math.round(viewBounds.y)+0.5,
	        Math.round(viewBounds.width)-1, // -1 to keep border drawing contained within bounds
	        Math.round(viewBounds.height)-1 // -1 to keep border drawing contained within bounds
        );

        // Traverse to sub nodes
        var nLen = node.nodes.length;
        for (var i = 0; i < nLen; i++)
            drawNode(node.nodes[i]);

    };

    drawNode(tree.root);
};

/**
 * Render range values in corners of viewport
 */
Debugger.prototype.renderRange = function() {
    var plotSpace = this.viewport;
    var viewSpace = this.viewport.viewSpace;
    var context = this.ctx;

    context.font = '11px Arial';
    context.fillStyle = '#0000ff';

    // Draw min ranges at top left
    context.textAlign = 'start';
    context.textBaseline = 'top';
    context.fillText('('+plotSpace.x+', '+plotSpace.y+')', 5, 5);

    // Draw max ranges at bottom right
    context.textAlign = 'end';
    context.textBaseline = 'botttom';
    context.fillText('('+plotSpace.xMax+', '+plotSpace.yMax+')', viewSpace.width - 5, viewSpace.height - 20);
};

/**
 * Render the items in our viewport
 */
Debugger.prototype.renderItems = function() {
	var context = this.ctx;
	var items = this.viewportManager.items;
	var numItems = items.length;
	var viewport = this.viewport;

	context.strokeStyle = '#05ece4'; // Draw items turquoise

	for (var i = 0; i < numItems; i++) {
		if (!viewport.doBoundsIntersect(items[i])) continue;

		var viewChildBounds = viewport.plotToViewSpaceBounds(items[i]);

		context.strokeRect(
			Math.round(viewChildBounds.x)+0.5,
			Math.round(viewChildBounds.y)+0.5,
			Math.round(viewChildBounds.width)-1, // -1 to keep border drawing contained within bounds
			Math.round(viewChildBounds.height)-1 // -1 to keep border drawing contained within bounds
		);
	}
};

exports = module.exports = Debugger;