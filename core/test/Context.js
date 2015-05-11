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
var Node = require('../Node');
var Dispatch = require('../Dispatch');

test('Context', function(t) {
    t.test('constructor', function(t) {
        t.equal(typeof Context, 'function', 'Context should be a constructor function');
    
        var receivedMessages = [];
        var mockFamous = {
            message: function(message) {
                receivedMessages.push(message);
                return mockFamous;
            }
        };
        new Context('.context-constructor', mockFamous);

        t.deepEqual(receivedMessages, ['NEED_SIZE_FOR', '.context-constructor']);
        t.end();
    });

    t.test('getUpdater method', function(t) {
        var mockFamous = {
            message: function() { return mockFamous; }
        };
        var context = new Context('.context-get-updater', mockFamous);
        t.equal(typeof context.getUpdater, 'function', 'context.getUpdater should be a function');
        t.equal(context.getUpdater(), mockFamous);
        t.end();
    });

    t.test('getSelector method', function(t) {
        var mockFamous = {
            message: function() { return mockFamous; }
        };
        var context = new Context('.context-get-selector', mockFamous);
        t.equal(typeof context.getUpdater, 'function', 'context.getUpdater should be a function');
        t.equal(context.getSelector(), '.context-get-selector');
        t.end();
    });

    t.test('getDispatch method', function(t) {
        var mockFamous = {
            message: function() { return mockFamous; }
        };
        var context = new Context('.context-get-dispatch', mockFamous);
        t.equal(typeof context.getUpdater, 'function', 'context.getDispatch should be a function');
        t.equal(context.getDispatch().constructor, Dispatch, 'context.getDispatch should return Dispatch instance');
        t.end();
    });

    t.test('onReceive method', function(t) {
        var mockFamous = {
            message: function() {
                return mockFamous;
            },
            requestUpdate: function () {
                t.pass('Context should request update on size change');
            }
        };
        var context = new Context('.context-on-receive', mockFamous);
        t.equal(typeof context.onReceive, 'function', 'context.onReceive should be a function');
        context.onReceive('CONTEXT_RESIZE', [100, 200]);
        t.deepEqual(context.getComputedValue().computedValues.size, [0, 0, 0]);
        context.onUpdate(100);
        t.deepEqual(context.getComputedValue().computedValues.size, [100, 200, 0]);
        t.end();
    });
});
