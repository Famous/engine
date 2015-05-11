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
var CallbackStore = require('../CallbackStore');

test('CallbackStore', function(t) {
    t.test('constructor', function(t) {
        t.doesNotThrow(function() {
            new CallbackStore();
        });
        t.end();
    });

    t.test('on method', function(t) {
        t.plan(2);

        var cs = new CallbackStore();
        t.equal(typeof cs.on, 'function', 'cs.on should be a function');

        var eggEv = {};

        var i = 0;
        var id = cs.on('egg', function(ev) {
            if (i++ > 0) {
                t.fail('cs.off should remove the listener with the id returned by cs.off');
            }
            t.equal(ev, eggEv);
        });

        cs.trigger('egg', eggEv);

        cs.off('egg', id);
        cs.trigger('egg', eggEv);
    });

    t.test('off method', function(t) {
        t.plan(3);

        var cs = new CallbackStore();
        t.equal(typeof cs.off, 'function', 'cs.off should be a function');

        var chickenEv = {};

        var i = 0;

        cs.on('chicken', function(ev) {
            t.equal(i++, 0);
            t.equal(ev, chickenEv);
        });

        var listener = function() {
            t.fail();
        };

        cs.on('chicken', listener);
        cs.off('chicken', listener);

        cs.trigger('chicken', chickenEv);
    });

    t.test('trigger method', function(t) {
        t.plan(7);

        var cs = new CallbackStore();
        t.equal(typeof cs.trigger, 'function', 'cs.trigger should be a function');

        var chickenEv = {};
        var eggEv = {};

        var i = 0;

        cs.on('chicken', function(ev) {
            t.equal(i++, 0);
            t.equal(ev, chickenEv);
        });

        cs.on('chicken', function(ev) {
            t.equal(i++, 1);
            t.equal(ev, chickenEv);
        });

        cs.on('egg', function(ev) {
            t.equal(i++, 2);
            t.equal(ev, eggEv);
        });

        cs.trigger('chicken', chickenEv);
        cs.trigger('egg', eggEv);
    });
});
