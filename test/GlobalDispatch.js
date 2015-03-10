'use strict';

global.self = global;

var test = require('tape');
var GlobalDispatch = require('../src/GlobalDispatch');

test('GlobalDispatch', function(t) {
    t.test('constructor', function(t) {
        t.plan(2);
        t.equal(typeof GlobalDispatch, 'function', 'GlobalDispatch should be a function');

        t.doesNotThrow(function() {
            new GlobalDispatch();
        });
    });

    t.test('receiveCommands method', function(t) {
        t.plan(1);
        var globalDispatch = new GlobalDispatch();
        t.equal(typeof globalDispatch.receiveCommands, 'function', 'globalDispatch.receiveCommands should be a function');
    });

    t.test('handleMessage method', function(t) {
        t.plan(3);
        var globalDispatch = new GlobalDispatch();
        t.equal(typeof globalDispatch.handleMessage, 'function', 'globalDispatch.handleMessage should be a function');

        globalDispatch.targetedOn('chicken/egg', 'eventname', function (ev) {
            t.equal(ev, 'event');
        });

        t.equal(globalDispatch.handleMessage(['chicken/egg', 'TRIGGER', 'eventname', 'event']), globalDispatch, 'globalDispatch.handleMessage should be chainable');
    });

    t.test('targetedOn method', function(t) {
        t.plan(1);
        var globalDispatch = new GlobalDispatch();
        t.equal(typeof globalDispatch.targetedOn, 'function', 'globalDispatch.targetedOn should be a function');
    });

    t.test('targetedOff method', function(t) {
        t.plan(1);
        var globalDispatch = new GlobalDispatch();
        t.equal(typeof globalDispatch.targetedOff, 'function', 'globalDispatch.targetedOff should be a function');
    });

    t.test('globalOn method', function(t) {
        t.plan(2);
        var globalDispatch = new GlobalDispatch();
        t.equal(typeof globalDispatch.globalOn, 'function', 'globalDispatch.globalOn should be a function');

        t.equal(globalDispatch.globalOn('path/path2', 'testEvent', function() {}), globalDispatch, 'globalDispatch.globalOn should be chainable');
    });

    t.test('globalOff method', function(t) {
        t.plan(2);
        var globalDispatch = new GlobalDispatch();
        t.equal(typeof globalDispatch.globalOff, 'function', 'globalDispatch.globalOff should be a function');

        var listener = function() {
            t.fail();
        };
        globalDispatch.globalOn('path/path2', 'testEvent', listener);
        t.equal(globalDispatch.globalOff('path/path2', 'testEvent', listener), globalDispatch, 'globalDispatch.globalOff should be chainable');

        var testEvent = {};
        globalDispatch.emit('testEvent', testEvent);
    });

    t.test('emit method', function(t) {
        t.plan(3);
        var globalDispatch = new GlobalDispatch();
        t.equal(typeof globalDispatch.emit, 'function', 'globalDispatch.emit should be a function');

        globalDispatch.globalOn('path/path2', 'testEvent', function(receivedEvent) {
            t.equal(receivedEvent, testEvent);
        });

        var testEvent = {};
        t.equal(globalDispatch.emit('testEvent', testEvent), globalDispatch, 'globalDispatch.emit should be chainable');
    });

    t.test('message method', function(t) {
        t.plan(1);
        var globalDispatch = new GlobalDispatch();
        t.equal(typeof globalDispatch.message, 'function', 'globalDispatch.message should be a function');
    });

    t.test('getMessages method', function(t) {
        t.plan(2);
        var globalDispatch = new GlobalDispatch();
        t.equal(typeof globalDispatch.getMessages, 'function', 'globalDispatch.getMessages should be a function');

        var messages = ['this', 'is', 'a', 'test'];
        messages.forEach(function(message) {
            globalDispatch.message(message);
        });

        t.deepEqual(globalDispatch.getMessages(), messages);
    });
});
