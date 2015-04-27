'use strict';

var test = require('tape');
var Context = require('../src/Context');
var Compositor = require('../src/Compositor');

test('Context', function(t) {
    t.test('constructor', function(t) {
        var compositor = new Compositor();
        var context = new Context('body', compositor);

        t.ok(context.DOMRenderer, 'Should have a DOMRenderer');
        t.ok(context._renderState, 'Should have a renderState object');

        t.ok(Array.isArray(context._size), 'Should have a size array');

        t.end();
    });

    t.test('Context.prototype.updateSize', function(t) {
        // TODO: These tests.

        t.end();
    });

    t.test('Context.prototype.draw', function(t) {
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

    t.test('Context.prototype.initWebGL', function(t) {
        // TODO: These tests.
        
        t.end();
    });

    t.test('Context.prototype.getRootSize', function(t) {
        var context = new Context('body');
        var rootSize = context.getRootSize();

        t.deepEquals(rootSize, context._size.slice(0, 2), 'Should return _size property');

        t.end();
    });

    t.test('Context.prototype.receive', function(t) {

        t.end();
    });
});
