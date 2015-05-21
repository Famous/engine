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
var ContainerLoop = require('../ContainerLoop');

test('ContainerLoop', function(t) {
    t.test('constructor', function(t) {
        t.equal(typeof ContainerLoop, 'function', 'ContainerLoop should be a constructor function');
        t.doesNotThrow(function() {
            new ContainerLoop();
        });
        t.end();
    });

    t.test('isRunning method', function(t) {
        t.plan(2);
        var engine = new ContainerLoop();
        t.equal(typeof engine.isRunning, 'function', 'engine.isRunning should be a function');
        t.equal(engine.isRunning(), true, 'ContainerLoop should be running by default');
    });

    t.test('update method', function(t) {
        t.plan(2);
        var engine = new ContainerLoop();
        t.equal(typeof engine.update, 'function', 'engine.update should be a function');
        var expectedUpdates = [12, 14, 18, 20, 45, 67, 89];
        var actualUpdates = [];
        engine.update({
            update: function(time) {
                actualUpdates.push(time);
                if (actualUpdates.length === expectedUpdates.length) {
                    t.deepEqual(actualUpdates.map(function(update) {
                        return Math.round(update);
                    }), expectedUpdates);
                }
            }
        });

        expectedUpdates.forEach(function (time) {
            window.postMessage(['FRAME', time], '*');
        });
    });

    t.test('noLongerUpdate method', function(t) {
        t.plan(2);
        var engine = new ContainerLoop();
        t.equal(typeof engine.noLongerUpdate, 'function', 'engine.noLongerUpdate should be a function');

        var updateable = {
            update: function(time) {
                t.equal(Math.round(time), 123);
                engine.noLongerUpdate(updateable);
                window.postMessage(['FRAME', 124], '*');
            }
        };
        engine.update(updateable);

        window.postMessage(['FRAME', 123], '*');
    });

    t.test('start method', function(t) {
        t.plan(1);
        var engine = new ContainerLoop();
        t.equal(typeof engine.start, 'function', 'engine.start should be a function');
    });

    t.test('stop method', function(t) {
        t.plan(2);
        var engine = new ContainerLoop();
        t.equal(typeof engine.stop, 'function', 'engine.stop should be a function');

        engine.stop();
        t.equal(engine.isRunning(), false, 'engine.stop should stop the engine');

        engine.update({
            update: function() {
                t.fail();
            }
        });

        window.postMessage(['FRAME', 123], '*');
    });

    t.test('step method', function(t) {
        t.plan(2);
        var engine = new ContainerLoop();
        t.equal(typeof engine.step, 'function', 'engine.step should be a function');
        engine.stop();

        engine.update({
            update: function(time) {
                t.equal(time, 123, 'engine.step should work if the engine is currently not running');
            }
        });
        engine.step(123);
    });

    t.test('normalize time', function(t) {
        t.plan(1);
        var engine = new ContainerLoop();
        engine.stop();

        window.postMessage(['FRAME', 100], '*');

        setTimeout(function() {
            engine.start();

            engine.update({
                update: function(time) {
                    t.ok(100 - time < 5);
                }
            });

            window.postMessage(['FRAME', 1100], '*');
        }, 1000);
    });
});
