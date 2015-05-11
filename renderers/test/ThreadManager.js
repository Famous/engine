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
var ThreadManager = require('../ThreadManager');

test('ThreadManager', function(t) {
    t.test('constructor', function(t) {
        t.plan(2);

        t.equal(typeof ThreadManager, 'function', 'ThreadManager should be a function');

        var noop = function() {};

        t.doesNotThrow(function() {
            new ThreadManager({
                onmessage: null,
                onerror: null,
                postMessage: noop
            }, {
                receiveCommands: noop,
                drawCommands: noop,
                clearCommands: noop
            });
        }, 'ThreadManager constructor should not throw an error');
    });

    t.test('update method', function(t) {
        var actions = [];
        var thread = {
            postMessage: function(message) {
                actions.push(['postMessage', message]);
            }
        };
        var compositor = {
            drawCommands: function() {
                actions.push(['drawCommands'])
            },
            clearCommands: function() {
                actions.push(['clearCommands'])
            }
        };
        var threadManager = new ThreadManager(thread, compositor);
        t.equal(typeof threadManager.update, 'function', 'threadManager.update should be a function');

        threadManager.update(123);
        threadManager.update(124);

        t.deepEqual(actions, [
            ['postMessage', ['FRAME', 123]],
            ['drawCommands'],
            ['postMessage', undefined],
            ['clearCommands'],
            ['postMessage', ['FRAME', 124]],
            ['drawCommands'],
            ['postMessage', undefined],
            ['clearCommands']
        ]);

        t.end();
    });

    t.test('getCompositor/ getThread method', function(t) {
        var thread = {};
        var compositor = {};
        var threadManager = new ThreadManager(thread, compositor);
        t.equal(typeof threadManager.getThread, 'function', 'threadManager.getThread should be a function');
        t.equal(typeof threadManager.getCompositor, 'function', 'threadManager.getCompositor should be a function');
        t.equal(threadManager.getThread(), thread, 'threadManager.getThread should return used thread');
        t.equal(threadManager.getCompositor(), compositor, 'threadManager.getCompositor should return used thread');
        t.end();
    });

    t.test('integration', function(t) {
        t.plan(8);

        var commands = ['SOME', 'COMMANDS'];
        var postedMessages = [];

        var clearedCommands = false;

        var thread = {
            onmessage: null,
            onerror: null,
            postMessage: function(receivedMessage) {
                postedMessages.push(receivedMessage);
            }
        };

        var compositor = {
            receiveCommands: function(receivedCommands) {
                t.equal(commands, receivedCommands);
            },
            drawCommands: function() {
                return ['DRAW', 'COMMANDS'];
            },
            clearCommands: function() {
                clearedCommands = true;
            }
        };

        var threadManager = new ThreadManager(thread, compositor);
        t.equal(typeof thread.onmessage, 'function', 'threadManager should decorate thread#onmessage');
        t.equal(typeof thread.onerror, 'function', 'threadManager should decorate thread#onerror');

        thread.onmessage(commands);
        thread.onmessage({
            data: commands
        });

        t.equal(clearedCommands, false);

        t.deepEqual(postedMessages, []);
        threadManager.update(123);
        t.deepEqual(postedMessages, [
            ['FRAME', 123],
            ['DRAW', 'COMMANDS']
        ]);

        t.equal(clearedCommands, true);
    });
});
