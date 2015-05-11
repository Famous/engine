'use strict';

var test = require('tape');
var Context = require('../src/Context');
var Node = require('../src/Node');
var Dispatch = require('../src/Dispatch');

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
        var context = new Context('.context-constructor', mockFamous);

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
