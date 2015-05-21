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

var animationFrame = require('../animationFrame');
var rAF = animationFrame.requestAnimationFrame;
var cAF = animationFrame.cancelAnimationFrame;
var test = require('tape');

test('polyfills', function(t) {
    t.test('setup', function(t) {
        setTimeout(function() {
            t.end();
        }, 1000);
    });

    t.test('requestAnimationFrame method', function(t) {
        t.equal(typeof rAF, 'function', 'requestAnimationFrame should be a function');

        t.comment('Testing requestAnimationFrame (this might take a while)');

        var timestamps = [];

        rAF(function loop(time) {
            timestamps.push(time);
            if (timestamps.length < 60*10) {
                rAF(loop);
            }
            else {
                var fps = [];
                var curr = 0;
                var i;
                for (i = 0; i < timestamps.length; i++) {
                    var diff = timestamps[i] - curr;

                    if (diff < 1000) {
                        fps[fps.length - 1]++;
                    }
                    else {
                        curr = timestamps[i];
                        fps[fps.length] = 0;
                    }
                }

                for (i = 0; i < fps.length; i++) {
                    t.ok(
                        ~~(fps[i] - 60) <= 10,
                        fps[i] + ' should be 60 +/- 10 FPS'
                    );
                }

                t.end();
            }
        });
    });

    t.test('cancelAnimationFrame method', function(t) {
        t.equal(typeof cAF, 'function', 'cancelAnimationFrame should be a function');

        var requestId = rAF(function() {
            t.fail('Should have canceled request');
        });
        cancelAnimationFrame(requestId);

        setTimeout(function() {
            t.end();
        }, 32);
    });
});
