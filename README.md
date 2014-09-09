2d Viewport (thinking of hipster name)
======================================
[![Build Status](https://travis-ci.org/Chrisui/Viewport.svg?branch=master)](https://travis-ci.org/Chrisui/Viewport)

A 2d javascript viewport management library for use in node or the browser.
Meant to be the spatial object manager layer under your renderer.

###Features
- Viewport (spatial management, panning, zooming etc.)
- Quad tree index
- Fully extensible (uses [Constructr](https://github.com/Chrisui/Constructr))
- Viewport item manager (group mutation, snapping etc.)*
- Visual debugger*
- Grid index*

Key: Upcoming*

Install
-------
Coming soon to a package manager near you!

Develop/Debug
-------------
1. Ensure Node.js is installed
2. Ensure required global npm packages are installed with commands ```npm install -g mocha```
3. Run command ```npm install```
4. Boom!

Running Tests
-------------
Make sure you have mocha installed and `npm test`

TODO
----
Below is a non-exhaustive list of features/modifications which are intended to be completed/explored
- Item manager
- Interactive visual debugger for developers to layer with their own renderers (in the browser)
- Grid index to work alongside quad tree index
- Snap helper (snap to objects/snap to grid/smart snapping)