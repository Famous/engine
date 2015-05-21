/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

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

        context.DOMRenderer = {
            draw: function() {
                this.wasDrawn = true;
            }
        };

        context.WebGLRenderer = {
            draw: function() {
                this.wasDrawn = true;
            }
        };

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

        t.deepEquals(typeof rootSize[0], 'number', 'Should return pixel size');
        t.deepEquals(typeof rootSize[1], 'number', 'Should return pixel size');


        t.end();
    });

    t.test('receive method', function(t) {

        t.end();
    });
});
