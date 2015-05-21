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

/*jshint -W079 */

'use strict';

var test = require('tape');
var Scene = require('../Scene');
var Dispatch = require('../Dispatch');

test('Scene', function(t) {
    t.test('constructor', function(t) {
        t.equal(typeof Scene, 'function', 'Scene should be a constructor function');

        var receivedMessages = [];
        var mockFamous = {
            message: function(message) {
                receivedMessages.push(message);
                return mockFamous;
            },
            requestUpdate: function() {
                t.pass('should requestUpdate upong upon instantiation');
            }
        };
        new Scene('.scene-constructor', mockFamous);

        t.deepEqual(receivedMessages, ['NEED_SIZE_FOR', '.scene-constructor']);
        t.end();
    });

    t.test('getUpdater method', function(t) {
        var mockFamous = {
            message: function() {
                return mockFamous;
            },
            requestUpdate: function() {
            }
        };
        var scene = new Scene('.scene-get-updater', mockFamous);
        t.equal(typeof scene.getUpdater, 'function', 'scene.getUpdater should be a function');
        t.equal(scene.getUpdater(), mockFamous);
        t.end();
    });

    t.test('getSelector method', function(t) {
        var mockFamous = {
            message: function() {
                return mockFamous;
            },
            requestUpdate: function() {
            }
        };
        var scene = new Scene('.scene-get-selector', mockFamous);
        t.equal(typeof scene.getUpdater, 'function', 'scene.getUpdater should be a function');
        t.equal(scene.getSelector(), '.scene-get-selector');
        t.end();
    });

    t.test('getDispatch method', function(t) {
        var mockFamous = {
            message: function() {
                return mockFamous;
            },
            requestUpdate: function() {}
        };
        var scene = new Scene('.scene-get-dispatch', mockFamous);
        t.equal(typeof scene.getUpdater, 'function', 'scene.getDispatch should be a function');
        t.equal(scene.getDispatch().constructor, Dispatch, 'scene.getDispatch should return Dispatch instance');
        t.end();
    });

    t.test('onReceive method', function(t) {
        var mockFamous = {
            message: function() {
                return mockFamous;
            },
            requestUpdate: function () {
                t.pass('Scene should request update on size change');
            }
        };
        var scene = new Scene('.scene-on-receive', mockFamous);
        t.equal(typeof scene.onReceive, 'function', 'scene.onReceive should be a function');
        scene.onReceive('CONTEXT_RESIZE', [100, 200]);
        t.deepEqual(scene.getComputedValue().computedValues.size, [0, 0, 0]);
        scene.onUpdate(100);
        t.deepEqual(scene.getComputedValue().computedValues.size, [100, 200, 0]);
        t.end();
    });
});
