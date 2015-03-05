'use strict';

global.self = {};

var test = require('tape');
var Clock = require('../src/Clock');

test('Clock', function(t) {
    t.test('Singleton', function(t) {
        t.plan(1);
        t.equal(typeof Clock, 'object', 'Clock should be a singleton');
    });

    t.test('step method', function(t) {
        t.plan(1);
        t.equal(typeof Clock.step, 'function', 'Clock.step should be a function');

    });

    t.test('update method', function(t) {
        t.plan(3);
        t.equal(typeof Clock.update, 'function', 'Clock.update should be a function');

        var obj = {
            update: function(time) {
                t.pass();
                t.equal(time, 12);
            }
        };
        Clock.update(obj);

        Clock.step(12);
    });

    t.test('getTime method', function(t) {
        t.plan(1);
        t.equal(typeof Clock.getTime, 'function', 'Clock.getTime should be a function');
    });

    t.test('receiveCommands method', function(t) {
        t.plan(1);
        t.equal(typeof Clock.receiveCommands, 'function', 'Clock.receiveCommands should be a function');
    });
});
