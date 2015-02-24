'use strict';

var test = require('tape');
var MockDispatch = require('./MockDispatch');
var Position = require('../src/Position');

test('Position', function(t) {
    t.test('constructor', function(t) {
        t.doesNotThrow(function() {
            new Position(new MockDispatch());
        });
        t.end();
    });

    t.test('getState method', function(t) {
        t.plan(1);
        var dispatch = new MockDispatch();
        var position = new Position(dispatch);
        t.equal(typeof position.getState, 'function', 'position.getState should be a function');
    });

    t.test('setState method', function(t) {
        t.plan(1);
        var dispatch = new MockDispatch();
        var position = new Position(dispatch);
        t.equal(typeof position.setState, 'function', 'position.setState should be a function');
    });

    t.test('clean method', function(t) {
        t.plan(1);
        var dispatch = new MockDispatch();
        var position = new Position(dispatch);
        t.equal(typeof position.clean, 'function', 'position.clean should be a function');
    });

    t.test('setX method', function(t) {
        t.plan(1);
        var dispatch = new MockDispatch();
        var position = new Position(dispatch);
        t.equal(typeof position.setX, 'function', 'position.setX should be a function');
    });

    t.test('setY method', function(t) {
        t.plan(1);
        var dispatch = new MockDispatch();
        var position = new Position(dispatch);
        t.equal(typeof position.setY, 'function', 'position.setY should be a function');
    });

    t.test('setZ method', function(t) {
        t.plan(1);
        var dispatch = new MockDispatch();
        var position = new Position(dispatch);
        t.equal(typeof position.setZ, 'function', 'position.setZ should be a function');
    });

    t.test('set method', function(t) {
        t.plan(1);
        var dispatch = new MockDispatch();
        var position = new Position(dispatch);
        t.equal(typeof position.set, 'function', 'position.set should be a function');
    });

    t.test('halt method', function(t) {
        t.plan(1);
        var dispatch = new MockDispatch();
        var position = new Position(dispatch);
        t.equal(typeof position.halt, 'function', 'position.halt should be a function');
    });
});
