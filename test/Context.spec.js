'use strict';

var test = require('tape');
var Context = require('../src/Context');
var Compositor = require('../src/Compositor');
global.window = require('./TestingWindow');
global.document = window.document;

test('Context', function(t) {
    t.test('constructor', function(t) {
        var compositor = new Compositor();
        var context = new Context('body', compositor);

        t.ok(context.DOMRenderer, 'Should have a DOMRenderer');
        t.ok(context._renderState, 'Should have a renderState object');

        t.ok(Array.isArray(context._size), 'Should have a size array');
        t.ok(Array.isArray(context._renderers), 'Should have a renderers array');

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

        for (var i = 0; i < 5; i++) {
            context._renderers.push({
                draw: function () {
                    drawCallsIssued++;
                }
            });
        }

        context.draw();

        t.equals(
            drawCallsIssued,
            5,
            'Should call draw on all renderers'
        );

        t.end();
    });

    t.test('Context.prototype.initWebGL', function(t) {
        // var context = new Context('body');

        // context.initWebGL();

        // t.ok(
        //     context.WebGLRenderer,
        //     'Should create a WebGLRenderer'
        // );
        
        t.end();
    });

    t.test('Context.prototype.getRootSize', function(t) {
        var context = new Context('body');
        var rootSize = context.getRootSize();

        t.equals(rootSize, context._size, 'Should return _size property');

        t.end();
    });

    t.test('Context.prototype.receive', function(t) {

        t.end();
    });
});
