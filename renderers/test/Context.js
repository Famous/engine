'use strict';

var test = require('tape');
var Context = require('../Context');
var Compositor = require('../Compositor');

test('Context', function(t) {
    t.test('constructor', function(t) {
        var compositor = new Compositor();
        var context = new Context('body', compositor);

        t.ok(context.DOMRenderer, 'Should have a DOMRenderer');
        t.ok(context._renderState, 'Should have a renderState object');

        t.ok(Array.isArray(context._size), 'Should have a size array');

        t.end();
    });

    t.test('updateSize method', function(t) {
        // TODO: These tests.

        t.end();
    });

    t.test('draw method', function(t) {
        var context = new Context('body');
        var dummyRenderers = [];
        var drawCallsIssued = 0;

        context.DOMRenderer = { draw: function() { this.wasDrawn = true; } };
        context.WebGLRenderer = { draw: function() { this.wasDrawn = true; } };

        context.draw();

        t.ok(context.DOMRenderer.wasDrawn, 'Should call draw on the DOMRenderer');
        t.ok(context.WebGLRenderer.wasDrawn, 'Should call draw on the WebGLRenderer');

        t.end();
    });

    t.test('initWebGL method', function(t) {
        // TODO: These tests.

        t.end();
    });

    t.test('getRootSize method', function(t) {
        var context = new Context('body');
        var rootSize = context.getRootSize();

        t.deepEquals(rootSize, context._size.slice(0, 2), 'Should return _size property');

        t.end();
    });

    t.test('receive method', function(t) {

        t.end();
    });
});
