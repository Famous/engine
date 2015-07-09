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
var FamousEngine = require('../../FamousEngine');
var Clock = require('../../Clock');
var Scene = require('../../Scene');
var Commands = require('../../Commands');
var api = require('./FamousEngine.api');

function onUpdateWrap(fn) {
    return {
        onUpdate: fn
    };
}

test('FamousEngine', function(t) {
    t.test('should conform to its public api', function (t) {

        api.forEach(function (method) {
            t.ok(FamousEngine[method], 'FamousEngine should have a ' +
                                    method + ' method');

            t.equal(FamousEngine[method].constructor, Function, 'FamousEngine.'
                                                 + method + ' should be a function');
        });

        t.end();
    });

    t.test('requestUpdate method (basic)', function(t) {
        t.plan(3);

        FamousEngine.getChannel().onmessage = function(commands) {
            t.deepEqual(
                commands,
                [Commands.TIME, 10],
                'FamousEngine should send the [TIME, ...] commmand when ' +
                'running .step on it'
            );
        };

        var executionOrder = [];
        FamousEngine.requestUpdate(onUpdateWrap(function(time) {
            t.equal(time, 10, 'onUpdate function should receive passed in time as an argument');
            executionOrder.push(0);
        }));
        FamousEngine.requestUpdate(onUpdateWrap(function() {
            executionOrder.push(1);
        }));

        FamousEngine.step(10);

        t.deepEqual(executionOrder, [ 0, 1 ]);
    });

    t.test('setup onmessage mock', function(t) {
        FamousEngine.getChannel().onmessage = function() {};

        // The Channel#onmessage method is being shared across tests. It is
        // being set to a noop in this setup.

        t.end();
    });

    t.test('requestUpdate method (nested)', function(t) {
        t.plan(1);
        var executionOrder = [];

        FamousEngine.requestUpdate(onUpdateWrap(function() {
            executionOrder.push(0);

            FamousEngine.requestUpdate(onUpdateWrap(function() {
                executionOrder.push(2);

                FamousEngine.requestUpdate(onUpdateWrap(function() {
                    executionOrder.push(3);
                }));
            }));
        }));

        FamousEngine.requestUpdate(onUpdateWrap(function() {
            executionOrder.push(1);
        }));

        FamousEngine.step(0);
        FamousEngine.step(1);
        FamousEngine.step(2);

        t.deepEqual(executionOrder, [ 0, 1, 2, 3 ]);
    });

    t.test('requestUpdate method (corner case)', function(t) {
        t.plan(1);
        t.doesNotThrow(function() {
            var objectWithoutOnUpdateMethod = {};
            FamousEngine.requestUpdate(objectWithoutOnUpdateMethod);
            FamousEngine.step(10);
        }, 'FamousEngine.requestUpdate method should not throw an error when being invoked');
    });

    t.test('requestUpdateOnNextTick method', function(t) {
        var executionOrder = [];
        FamousEngine.requestUpdateOnNextTick(onUpdateWrap(function() {
            executionOrder.push(0);
            FamousEngine.requestUpdateOnNextTick(onUpdateWrap(function() {
                executionOrder.push(2);
            }));
        }));
        FamousEngine.requestUpdateOnNextTick(onUpdateWrap(function() {
            executionOrder.push(1);
        }));

        t.deepEqual(executionOrder, []);
        FamousEngine.step(0);
        t.deepEqual(executionOrder,  [ 0, 1 ]);
        FamousEngine.step(1);
        t.deepEqual(executionOrder, [ 0, 1, 2 ]);
        FamousEngine.step(2);
        t.deepEqual(executionOrder,  [ 0, 1, 2 ]);
        t.end();
    });

    t.test('postMessage method (FRAME command)', function(t) {
        FamousEngine.getChannel().postMessage([Commands.FRAME, 123]);
        t.equal(FamousEngine.getClock().now(), 123);
        FamousEngine.getChannel().postMessage([Commands.FRAME, 124, Commands.FRAME, 125]);
        t.equal(FamousEngine.getClock().now(), 125);
        FamousEngine.getChannel().postMessage([Commands.FRAME, 126]);
        t.equal(FamousEngine.getClock().now(), 126);

        t.end();
    });

    t.test('createScene method', function(t) {
        var scene0 = FamousEngine.createScene('.div-0');
        var scene1 = FamousEngine.createScene('.div-1');

        t.equal(scene0.constructor, Scene, 'FamousEngine.createScene should return Scene instances');
        t.equal(scene1.constructor, Scene, 'FamousEngine.createScene should return Scene instances');
        t.notEqual(scene0, scene1, 'FamousEngine.createScene being invoked on two different selectors should return different scene instances');

        FamousEngine.getChannel().onmessage = function() {};
        FamousEngine.step(0);
        FamousEngine.removeScene(scene0);
        FamousEngine.removeScene(scene1);
        t.end();
    });

    t.test('removeScene method', function(t) {
        var scene0 = FamousEngine.createScene('.div-0');

        FamousEngine.removeScene(scene0);

        t.assert(!scene0.isMounted(), 'FamousEngine.removeScene should dismount the removed scene');
        t.assert(FamousEngine._scenes['.div-0'] == null, 'FamousEngine.removeScene should remove references to the scene');

        FamousEngine.getChannel().onmessage = function() {};
        FamousEngine.step(0);
        t.end();
    });

    t.test('getClock method', function(t) {
        t.plan(2);

        t.equal(FamousEngine.getClock().constructor, Clock, 'FamousEngine.getClock should return clock instance');
        t.equal(FamousEngine.getClock(), FamousEngine.getClock(), 'FamousEngine.getClock should return clock singleton');
    });

    t.test('step method', function(t) {
        t.plan(2);

        FamousEngine.message('m');
        FamousEngine.message('and');
        FamousEngine.message('ms');
        var receivedMessages = [];
        FamousEngine.getChannel().onmessage = function(message) {
            receivedMessages.push(message.slice());
        };
        FamousEngine.step(3141);
        t.equal(FamousEngine.getClock().getTime(), 3141, 'FamousEngine.step should update clock');
        FamousEngine.message(3142);
        FamousEngine.step(3143);

        t.deepEqual(
            receivedMessages,
            [ [ Commands.TIME, 3141, 'm', 'and', 'ms' ], [ Commands.TIME, 3143, 3142 ] ]
        );
    });

    t.test('handleFrame method', function(t) {
        t.plan(1);

        FamousEngine.handleFrame([10]);
        t.equal(FamousEngine.getClock().getTime(), 10, 'FamousEngine.handleFrame should update internal clock');
    });
});
