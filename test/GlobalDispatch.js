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
        t.plan(1);
        var globalDispatch = new GlobalDispatch();
        t.equal(typeof globalDispatch.handleMessage, 'function', 'globalDispatch.handleMessage should be a function');

    });

    t.test('targetedOn method', function(t) {
        t.plan(1);
        var globalDispatch = new GlobalDispatch();
        t.equal(typeof globalDispatch.targetedOn, 'function', 'globalDispatch.targetedOn should be a function');

    });

    t.test('globalOn method', function(t) {
        t.plan(1);
        var globalDispatch = new GlobalDispatch();
        t.equal(typeof globalDispatch.globalOn, 'function', 'globalDispatch.globalOn should be a function');

    });

    t.test('emit method', function(t) {
        t.plan(2);
        var globalDispatch = new GlobalDispatch();
        t.equal(typeof globalDispatch.emit, 'function', 'globalDispatch.emit should be a function');

        globalDispatch.globalOn('path/path2', 'testEvent', function(receivedEvent) {
            t.equal(receivedEvent, testEvent);
        });

        var testEvent = {};
        globalDispatch.emit('testEvent', testEvent);
    });

    t.test('message method', function(t) {
        t.plan(1);
        var globalDispatch = new GlobalDispatch();
        t.equal(typeof globalDispatch.message, 'function', 'globalDispatch.message should be a function');
    });

    t.test('flush method', function(t) {
        t.plan(2);
        var globalDispatch = new GlobalDispatch();
        t.equal(typeof globalDispatch.flush, 'function', 'globalDispatch.flush should be a function');

        var postedMessages = null;
        global.self.postMessage = function (receivedMessages) {
            postedMessages = receivedMessages.slice();
        };

        var messages = ['this', 'is', 'a', 'test'];
        messages.forEach(function(message) {
            globalDispatch.message(message);
        });

        globalDispatch.flush();
        t.deepEqual(postedMessages, messages);
    });
});
