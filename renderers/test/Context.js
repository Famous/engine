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

var noop = function() {};

test('Context', function(t) {
    t.test('constructor', function(t) {
        t.plan(3);

        t.equal(
            typeof Context,
            'function',
            'Context should b a constructor function'
        );

        new Context('body', {
            sendResize: function(selector, size) {
                t.equal(selector, 'body', 'Context should sendResize with selector');
                t.ok(size instanceof Array && size.length === 3, 'Context should send size as an array with three elements');
            }
        });
    });

    t.test('draw method', function(t) {
        var context = new Context('body', {
            sendResize: noop
        });

        context._domRenderer = {
            draw: function() {
                this.wasDrawn = true;
            }
        };

        context._webGLRenderer = {
            draw: function() {
                this.wasDrawn = true;
            }
        };

        context.draw();

        t.ok(context._domRenderer.wasDrawn, 'Should call draw on the DOMRenderer');
        t.ok(context._webGLRenderer.wasDrawn, 'Should call draw on the WebGLRenderer');

        t.end();
    });
});
