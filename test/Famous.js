'use strict';

var test = require('tape');
var Famous = require('../src/Famous');
var Clock = require('../src/Clock');
var Context = require('../src/Context');

function onUpdateWrap(fn) {
    return {
        onUpdate: fn
    };
}

test('Famous', function(t) {
    t.test('should be a singleton', function(t) {
        t.plan(1);
        t.equal(typeof Famous, 'object', 'Famous should be a singleton');
    });

    t.test('requestUpdate method (basic)', function(t) {
        t.plan(3);
        t.equal(typeof Famous.requestUpdate, 'function', 'Famous.requestUpdate should be a function');

        var executionOrder = [];
        Famous.requestUpdate(onUpdateWrap(function(time) {
            t.equal(time, 10, 'onUpdate function should receive passed in time as an argument');
            executionOrder.push(0);
        }));
        Famous.requestUpdate(onUpdateWrap(function() {
            executionOrder.push(1);
        }));

        Famous.step(10);

        t.deepEqual(executionOrder, [ 0, 1 ]);
    });

    t.test('requestUpdate method (nested)', function(t) {
        t.plan(1);
        var executionOrder = [];
        Famous.requestUpdate(onUpdateWrap(function() {
            executionOrder.push(0);

            Famous.requestUpdate(onUpdateWrap(function() {
                executionOrder.push(2);

                Famous.requestUpdate(onUpdateWrap(function() {
                    executionOrder.push(3);
                }));
            }));
        }));

        Famous.requestUpdate(onUpdateWrap(function() {
            executionOrder.push(1);
        }));

        Famous.step(0);
        Famous.step(1);
        Famous.step(2);

        t.deepEqual(executionOrder, [ 0, 1, 2, 3 ]);
    });

    t.test('requestUpdate method (corner case)', function(t) {
        t.plan(1);
        t.doesNotThrow(function() {
            var objectWithoutOnUpdateMethod = {};
            Famous.requestUpdate(objectWithoutOnUpdateMethod);
            Famous.step(10);
        }, 'Famous.requestUpdate method should not throw an error when being invoked ')
    });

    t.test('requestUpdateOnNextTick method', function(t) {
        t.equal(typeof Famous.requestUpdateOnNextTick, 'function', 'Famous.requestUpdateOnNextTick should be a function');
        var executionOrder = [];
        Famous.requestUpdateOnNextTick(onUpdateWrap(function() {
            executionOrder.push(0);
            Famous.requestUpdateOnNextTick(onUpdateWrap(function() {
                executionOrder.push(2);
            }));
        }));
        Famous.requestUpdateOnNextTick(onUpdateWrap(function() {
            executionOrder.push(1);
        }));

        t.deepEqual(executionOrder, []);
        Famous.step(0);
        t.deepEqual(executionOrder,  [ 0, 1 ]);
        Famous.step(1);
        t.deepEqual(executionOrder, [ 0, 1, 2 ]);
        Famous.step(2);
        t.deepEqual(executionOrder,  [ 0, 1, 2 ]);
        t.end();
    });

    t.test('postMessage method (FRAME command)', function(t) {
        t.equal(typeof Famous.postMessage, 'function', 'Famous.postMessage should be a function');
        Famous.postMessage(['FRAME', 123]);
        t.equal(Famous.getClock().now(), 123);
        Famous.postMessage(['FRAME', 124, 'FRAME', 125]);
        t.equal(Famous.getClock().now(), 125);
        Famous.postMessage(['FRAME', 126]);
        t.equal(Famous.getClock().now(), 126);

        t.end();
    });

    t.test('createContext method', function(t) {
        t.equal(typeof Famous.createContext, 'function', 'Famous.createContext should be a function');
        var context0 = Famous.createContext('.div-0');
        var context1 = Famous.createContext('.div-1');

        t.equal(context0.constructor, Context, 'Famous.createContext should return Context instances');
        t.equal(context1.constructor, Context, 'Famous.createContext should return Context instances');
        t.notEqual(context0, context1, 'Famous.createContext being invoked on two different selectors should return different context instances');

        Famous.onmessage = function() {};
        Famous.step(0);
        t.end();
    });

    t.test('getClock method', function(t) {
        t.plan(3);
        t.equal(typeof Famous.getClock, 'function', 'Famous.getClock should be a function');
        t.equal(Famous.getClock().constructor, Clock, 'Famous.getClock should return clock instance');
        t.equal(Famous.getClock(), Famous.getClock(), 'Famous.getClock should return clock singleton');
    });

    t.test('step method', function(t) {
        t.plan(3);
        t.equal(typeof Famous.step, 'function', 'Famous.step should be a function');
        Famous.message('m');
        Famous.message('and');
        Famous.message('ms');
        var receivedMessages = [];
        Famous.onmessage = function(message) {
            receivedMessages.push(message.slice());
        };
        Famous.step(3141);
        t.equal(Famous.getClock().getTime(), 3141, 'Famous.step should update clock');
        Famous.message(3142);
        Famous.step(3143);

        t.deepEqual(receivedMessages, [ [ 'm', 'and', 'ms' ], [ 3142 ] ]);
    });

    t.test('handleFrame method', function(t) {
        t.plan(2);
        t.equal(typeof Famous.handleFrame, 'function', 'Famous.handleFrame should be a function');

        // complete received command would be ['FRAME', 10]
        Famous.handleFrame([10]);
        t.equal(Famous.getClock().getTime(), 10, 'Famous.handleFrame should update internal clock');
    });
});
