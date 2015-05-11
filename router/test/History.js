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
var _History = require('../History');

test('_History', function (t) {
    t.test('constructor', function (t) {
        t.plan(2);
        t.ok(_History() instanceof _History, 'new keyword should be optional');
        var history = _History({ hashBangUrls: true });
        t.equal(history.hashBangUrls, true);
    });

    t.test('pushState method', function (t) {
        t.plan(5);
        var history = _History();
        t.ok(history.pushState instanceof Function, 'history.pushState should be a function');
        history.pushState({}, '', '/exampler-route-1');
        t.equal(history.getState(), '/exampler-route-1');
        history.pushState({}, '', '/exampler-route-2');
        t.equal(history.getState(), '/exampler-route-2');
        history.pushState({}, '', '/exampler-route-3');
        t.equal(history.getState(), '/exampler-route-3');
        var listener = function() {
            t.equal(history.getState(), '/exampler-route-2');
            history.offStateChange(listener);
        };
        history.onStateChange(listener);
        window.history.back();
    });

    t.test('pushState method (hashBangUrls)', function (t) {
        t.plan(5);
        var history = _History({ hashBangUrls: true });
        t.ok(history.pushState instanceof Function, 'history.pushState should be a function');
        history.pushState({}, '', '/exampler-route-1');
        t.equal(history.getState(), '/exampler-route-1');
        history.pushState({}, '', '/exampler-route-2');
        t.equal(history.getState(), '/exampler-route-2');
        history.pushState({}, '', '/exampler-route-3');
        t.equal(history.getState(), '/exampler-route-3');
        var listener = function() {
            t.equal(history.getState(), '/exampler-route-2');
            history.offStateChange(listener);
        };
        history.onStateChange(listener);
        window.history.back();
    });

    t.test('replaceState method', function (t) {
        t.plan(5);
        var history = _History();
        t.ok(history.replaceState instanceof Function, 'history.replaceState should be a function');
        history.pushState({}, '', '/exampler-route-1');
        t.equal(history.getState(), '/exampler-route-1');
        history.pushState({}, '', '/exampler-route-2');
        t.equal(history.getState(), '/exampler-route-2');
        history.replaceState({}, '', '/exampler-route-3');
        t.equal(history.getState(), '/exampler-route-3');
        var listener = function() {
            t.equal(history.getState(), '/exampler-route-1');
            history.offStateChange(listener);
        };
        history.onStateChange(listener);
        window.history.back();
    });

    t.test('replaceState method (hashBangUrls)', function (t) {
        t.plan(5);
        var history = _History();
        t.ok(history.replaceState instanceof Function, 'history.replaceState should be a function');
        history.pushState({}, '', '/exampler-route-1');
        t.equal(history.getState(), '/exampler-route-1');
        history.pushState({}, '', '/exampler-route-2');
        t.equal(history.getState(), '/exampler-route-2');
        history.replaceState({}, '', '/exampler-route-3');
        t.equal(history.getState(), '/exampler-route-3');
        var listener = function() {
            t.equal(history.getState(), '/exampler-route-1');
            history.offStateChange(listener);
        };
        history.onStateChange(listener);
        window.history.back();
    });

    t.test('teardown', function(t) {
        window.history.replaceState(null, '', 'index.html');
        t.end();
    });
});
