'use strict';

var test = require('tape');
var Position = require('../src/Position');

function noop() {}

test('Position', function(t) {
    t.test('constructor', function(t) {
        t.plan(1);
        var addedComponent;
        var position = new Position({
            addComponent: function(component) {
                addedComponent = component;
            }
        });
        t.equal(addedComponent, position, 'Position constructor should add itself as a component to the passed in LocalDispatch');
    });

    t.test('toString method', function(t) {
        t.equal(typeof Position.toString, 'function', 'Position.toString should be a function');
        t.equal(Position.toString(), 'Position');
        t.end();
    });

    t.test('getState method', function(t) {
        t.plan(2);
        var position = new Position({
            addComponent: noop,
            dirtyComponent: noop
        });
        t.equal(typeof position.getState, 'function', 'position.getState should be a function');
        position.setX(4);
        position.setY(5);
        position.setZ(96);
        t.deepEqual(position.getState(), {
            component: 'Position',
            x: 4,
            y: 5,
            z: 96
        });
    });

    t.test('setState method', function(t) {
        var position = new Position({
            addComponent: noop,
            dirtyComponent: noop
        });

        t.equal(typeof position.setState, 'function', 'position.setState should be a function');

        var state = {
            component: 'Position',
            x: 1,
            y: 2,
            z: 3
        };
        t.equal(position.setState(state), true, 'position.setState should return true when passed in state is valid');
        t.deepEqual(position.getState(), state, 'position.setState should set new state');

        var invalidState = {
            component: 'NotPosition',
            x: 1,
            y: 2,
            z: 3
        };
        t.equal(position.setState(invalidState), false, 'position.setState should return false when passed in state is invalid');
        t.notDeepEqual(position.getState(), invalidState, 'position.setState should ignore invalid states');

        t.end();
    });

    t.test('clean method', function(t) {
        t.plan(4);
        var position = new Position({
            addComponent: noop,
            dirtyComponent: function() {
                t.pass();
            },
            getContext: function() {
                return this._context;
            },
            _context: {
                setPosition: function (x, y, z) {
                    t.deepEqual(Array.prototype.slice.call(arguments), [1, 2, 3]);
                }
            }
        });
        t.equal(typeof position.clean, 'function', 'position.clean should be a function');
        position.set(1, 2, 3);
        t.equal(position.clean(), false, 'position.clean should return if any transition is active');
    });

    t.test('setX method', function(t) {
        t.plan(3);
        var position = new Position({
            dirtyComponent: function() {
                t.pass();
            },
            addComponent: noop
        });
        t.equal(typeof position.setX, 'function', 'position.setX should be a function');
        t.equal(position.setX(1), position, 'position.setX should be chainable');
    });

    t.test('setY method', function(t) {
        t.plan(3);
        var position = new Position({
            dirtyComponent: function() {
                t.pass();
            },
            addComponent: noop
        });
        t.equal(typeof position.setY, 'function', 'position.setY should be a function');
        t.equal(position.setY(1), position, 'position.setY should be chainable');
    });

    t.test('setZ method', function(t) {
        t.plan(3);
        var position = new Position({
            dirtyComponent: function() {
                t.pass();
            },
            addComponent: noop
        });
        t.equal(typeof position.setZ, 'function', 'position.setZ should be a function');
        t.equal(position.setZ(1), position, 'position.setZ should be chainable');
    });

    t.test('set method', function(t) {
        t.plan(4);
        var position = new Position({
            dirtyComponent: function() {
                t.pass()
            },
            addComponent: function() {
                t.pass();
            }
        });
        t.equal(typeof position.set, 'function', 'position.set should be a function');
        t.equal(position.set(1, 2, 3), position, 'position.set should be chainable');
    });

    t.test('halt method', function(t) {
        t.plan(2);
        var position = new Position({
            addComponent: noop
        });
        t.equal(typeof position.halt, 'function', 'position.halt should be a function');

        t.equal(position.halt(), position, 'position.halt() should be chainable');
    });
});
