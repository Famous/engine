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
var UIManager = require('../UIManager');

function noop() {}

test('UIManager', function(t) {
    t.test('constructor', function(t) {
        t.plan(3);

        t.equal(typeof UIManager, 'function', 'UIManager should be a function');

        var registeredUpdateables = [];

        var uiManager = new UIManager({
            onmessage: null,
            onerror: null,
            postMessage: noop
        }, {
            receiveCommands: noop,
            drawCommands: noop,
            clearCommands: noop
        }, {
            update: function (updateable) {
                registeredUpdateables.push(updateable);
            }
        });

        t.equal(
            registeredUpdateables.length,
            1,
            'uimanager should register exactly one updateable on the engine'
        );
        t.equal(
            registeredUpdateables[0],
            uiManager,
            'uiManager should register itself as an updateable on ' +
            'the passed in engine'
        );
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
                actions.push(['drawCommands']);
            },
            clearCommands: function() {
                actions.push(['clearCommands']);
            }
        };
        var uiManager = new UIManager(thread, compositor, {
            update: noop
        });
        t.equal(typeof uiManager.update, 'function', 'uiManager.update should be a function');

        uiManager.update(123);
        uiManager.update(124);

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
        var engine = {update: noop};
        var uiManager = new UIManager(thread, compositor, engine);
        t.equal(typeof uiManager.getThread, 'function', 'uiManager.getThread should be a function');
        t.equal(typeof uiManager.getCompositor, 'function', 'uiManager.getCompositor should be a function');
        t.equal(uiManager.getThread(), thread, 'uiManager.getThread should return used thread');
        t.equal(uiManager.getCompositor(), compositor, 'uiManager.getCompositor should return used thread');
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

        var engine = {
            update: noop
        };

        var uiManager = new UIManager(thread, compositor, engine);
        t.equal(typeof thread.onmessage, 'function', 'uiManager should decorate thread#onmessage');
        t.equal(typeof thread.onerror, 'function', 'uiManager should decorate thread#onerror');

        thread.onmessage(commands);
        thread.onmessage({
            data: commands
        });

        t.equal(clearedCommands, false);

        t.deepEqual(postedMessages, []);
        uiManager.update(123);
        t.deepEqual(postedMessages, [
            ['FRAME', 123],
            ['DRAW', 'COMMANDS']
        ]);

        t.equal(clearedCommands, true);
    });
});
