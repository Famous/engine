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

var RequestAnimationFrameLoop = require('../RequestAnimationFrameLoop');

test('RequestAnimationFrameLoop', function(t) {
    t.test('constructor', function(t) {
        t.plan(2);
        var engine;
        t.doesNotThrow(function() {
            engine = new RequestAnimationFrameLoop();
        });

        var updateable = {
            update: function() {
                t.pass();
                engine.noLongerUpdate(updateable);
                engine.stop();
            }
        };
        engine.update(updateable);
    });

    t.test('start method', function(t) {
        t.plan(1);
        var engine = new RequestAnimationFrameLoop();
        t.equal(typeof engine.start, 'function', 'engine.start should be a function');
        engine.stop();
    });

    t.test('stop method', function(t) {
        t.plan(1);
        var engine = new RequestAnimationFrameLoop();
        t.equal(typeof engine.stop, 'function', 'engine.stop should be a function');
        engine.stop();
    });

    t.test('isRunning method', function(t) {
        t.plan(3);
        var engine = new RequestAnimationFrameLoop();
        t.equal(typeof engine.isRunning, 'function', 'engine.isRunning should be a function');
        t.equal(engine.isRunning(), true, 'engine should be running as soon as it has been initialized');
        engine.stop();
        t.equal(engine.isRunning(), false, 'stop should stop the engine');
    });

    t.test('step method', function(t) {
        t.plan(1);
        var engine = new RequestAnimationFrameLoop();
        t.equal(typeof engine.step, 'function', 'engine.step should be a function');
        engine.stop();
    });

    t.test('loop method', function(t) {
        t.plan(1);
        var engine = new RequestAnimationFrameLoop();
        t.equal(typeof engine.loop, 'function', 'engine.loop should be a function');
        engine.stop();
    });

    t.test('update method', function(t) {
        t.plan(1);
        var engine = new RequestAnimationFrameLoop();
        t.equal(typeof engine.update, 'function', 'engine.update should be a function');
        engine.stop();
    });

    t.test('noLongerUpdate method', function(t) {
        t.plan(8);
        var engine = new RequestAnimationFrameLoop();
        t.equal(typeof engine.noLongerUpdate, 'function', 'engine.noLongerUpdate should be a function');

        var c = 0;
        var updateable = {
            update: function(time) {
                t.equal(typeof time, 'number', 'engine.loop should pass in the requestAnimationFrame timestamp');
                t.pass('engine should keep running until engine.noLongerUpdate has been invoked');

                if (c++ === 2) {
                    t.pass('engine.noLongerUpdate should prevent any further engine updates');
                    engine.noLongerUpdate(updateable);
                    engine.stop();
                }
            }
        };
        engine.update(updateable);
    });
});
