'use strict';

var test = require('tape');
var ThreadManager = require('../src/ThreadManager');

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
        var threadManager = new ThreadManager({}, {});
        t.equal(typeof threadManager.update, 'function', 'threadManager.update should be a function');
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
