var Victor = require('victor');
var Bounds = require('../lib/bounds');
var Viewport = require('../lib/viewport');
var Item = require('../lib/item');
var ViewportManager = require('../lib/viewportManager');
var Debugger = require('../lib/browser/debugger');
var $ = require('jquery-browserify');

var createElement = function(customStyles) {
    var div = document.createElement('div');
    customStyles = customStyles || {};

    styles = {
        'position': 'absolute',
        'top': '0',
        'left': '0',
        'zIndex': 5,
        'background': '#ccc'
    };

    for (var key in customStyles)
        styles[key] = customStyles[key];

    for (key in styles)
        div.style[key] = styles[key];

    return div;
};

var vp = new Viewport(
    new Victor(0,0),
    new Victor(1920,1080),
    new Bounds(
        new Victor(0,0),
        new Victor(1920,1080)
    )
);

var vpm = window.vpm = new ViewportManager(vp);

var container = createElement();
document.body.style.overflow = 'hidden';
document.body.appendChild(container);
var dbg = window.dbg = new Debugger(container, vpm);

var loop = function() {
    vpm.clearItems();

    for (var i = 0; i < 100; ++i) {
        var newItem = new Item(
            (new Victor(0,0)).randomize(new Victor(0,0), new Victor(1920, 1080)),
            new Victor(10,10)
        );

        vpm.addItem(newItem);
    }

    setTimeout(loop, 500);
};
loop();

var $window = $(window);
var mousePos = new Victor;

$window.on('mousedown', function(e) {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;

    $window.on('mousemove', function(e) {
        var newMousePos = new Victor(e.clientX, e.clientY);

        vpm.pan(
            vp.viewToPlotSpace(
                mousePos.subtract(newMousePos),
                true
            )
        );

        mousePos.copy(newMousePos);
    });

    $window.on('mouseup', function() {
        $window.off('mousemove');
    })
}).on('mousewheel', function(e) {
    e.preventDefault();

    vpm.zoom(
        e.originalEvent.deltaY < 0 ? 1 : -1,
        vp.clientToPlotSpace(
            new Victor(e.originalEvent.clientX, e.originalEvent.clientY)
        )
    );
});

