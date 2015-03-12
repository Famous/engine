'use strict';

// Mock Worker environment

var _addEventListenerFunctionCalls = [];
var _postMessageFunctionCalls = [];

global.self = {
    addEventListener: function() {
        _addEventListenerFunctionCalls.push(arguments);
    },
    postMessage: function() {
        _postMessageFunctionCalls.push(arguments);
    }
};

var test = require('tape');
var Famous = require('../src/Famous');
var Clock = require('../src/Clock');
var GlobalDispatch = require('../src/GlobalDispatch');

test('Famous', function(t) {
    t.test('singleton', function(t) {
        t.equal(typeof Famous, 'object', 'Famous should be a singleton object');
        t.end();
    });

    t.test('message event listener', function(t) {
        t.equal(_addEventListenerFunctionCalls.length, 1);
        t.deepEqual(_addEventListenerFunctionCalls[0][0], 'message');
        t.deepEqual(typeof _addEventListenerFunctionCalls[0][1], 'function');
        t.end();
    });

    t.test('FRAME command using message event', function(t) {
        t.plan(1);
        _addEventListenerFunctionCalls[0][1]({
            data: ['FRAME', 123]
        });
        process.nextTick(function() {
            t.equal(Famous.getClock().getTime(), 123, 'FRAME command should update clock');
        });
    });

    t.test('FRAME comamnd using postMessage', function(t) {
        t.plan(1);
        Famous.postMessage(['FRAME', 123]);
        t.equal(Famous.getClock().getTime(), 123, 'FRAME command should update clock');
    });

    t.test('postMessage function', function(t) {
        t.equal(typeof Famous.postMessage, 'function', 'Famous.postMessage should be a function');
        t.end();
    });

    t.test('onmessage function', function(t) {
        t.equal(typeof Famous.onmessage, 'function', 'Famous.onmessage should be a function');
        t.end();
    });

    t.test('getClock function', function(t) {
        t.plan(3);
        t.equal(typeof Famous.getClock, 'function', 'Famous.getClock should be a function');
        var clock = Famous.getClock();
        t.equal(clock.constructor, Clock, 'Famous.getClock should return clock');
        t.equal(Famous.getClock(), clock, 'Famousg.getClock should always return the same clock');
    });
    
    t.test('getGlobalDispatch function', function(t) {
        t.plan(3);
        t.equal(typeof Famous.getGlobalDispatch, 'function', 'Famous.getGlobalDispatch should be a function');
        var globalDispatch = Famous.getGlobalDispatch();
        t.equal(globalDispatch.constructor, GlobalDispatch, 'Famous.getGlobalDispatch should return globalDispatch');
        t.equal(Famous.getGlobalDispatch(), globalDispatch, 'Famousg.getGlobalDispatch should always return the same globalDispatch');
    });
});

