'use strict';

var test = require('tape');
var Position = require('../src/Position');

function noop() {}

test('Position', function(t) {
    t.test('constructor', function(t) {
        var addedComponent = null;
        var requestedUpdate = null;
        var position = new Position({
            addComponent: function(component) {
                addedComponent = component;
            },
            getPosition: function() {
                return [1, 2, 3];
            },
            requestUpdate: function(id) {
                requestedUpdate = id;
            }
        });

        t.equal(addedComponent, position, 'Position constructor should add itself as a component to the passed in LocalDispatch');
        t.equal(position.getX(), 1);
        t.equal(position.getY(), 2);
        t.equal(position.getZ(), 3);
        t.equal(addedComponent, position);
        t.equal(requestedUpdate, null);
        t.end();
    });

    t.test('toString method', function(t) {
        t.equal(typeof Position.toString, 'function', 'Position.toString should be a function');
        t.equal(Position.toString(), 'Position');
        t.end();
    });

    t.test('getState method', function(t) {
        var addedComponent = null;
        var requestedUpdate = null;
        var id = 123;
        var position = new Position({
            addComponent: function(component) {
                addedComponent = component;
                return id;
            },
            getPosition: function() {
                return [1, 1, 2];
            },
            requestUpdate: function(id) {
                requestedUpdate = id;
            }
        });
        t.equal(typeof position.getState, 'function', 'position.getState should be a function');
        t.deepEqual(position.getState(), {
            component: 'Position',
            x: 1,
            y: 1,
            z: 2
        });
        position.setX(4);
        position.setY(5);
        position.setZ(96);
        t.deepEqual(position.getState(), {
            component: 'Position',
            x: 4,
            y: 5,
            z: 96
        });
        t.equal(addedComponent, position);
        t.equal(requestedUpdate, id);
        t.end();
    });

    t.test('setState method', function(t) {
        var addedComponent = null;
        var requestedUpdate = null;
        var id = 123;
        var position = new Position({
            addComponent: function(component) {
                addedComponent = component;
                return id;
            },
            getPosition: function() {
                return [1, 1, 2];
            },
            requestUpdate: function(id) {
                requestedUpdate = id;
            }
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
        t.deepEqual(position.getState(), state, 'position.setState should ignore invalid states');

        t.end();
    });

    t.test('basic setter and getter methods (no transitions)', function(t) {
        t.plan(30);

        var addedComponent = null;
        var requestedUpdate = null;
        var id = 123;
        var setPosition = null;
        var position = new Position({
            addComponent: function(component) {
                addedComponent = component;
                return id;
            },
            getPosition: function() {
                return [1, 1, 2];
            },
            requestUpdate: function(id) {
                requestedUpdate = id;
            },
            setPosition: function(x, y, z) {
                setPosition = [x, y, z];
            }
        });

        t.equal(typeof position.setX, 'function', 'position.setX should be a function');
        t.equal(typeof position.setY, 'function', 'position.setY should be a function');
        t.equal(typeof position.setZ, 'function', 'position.setZ should be a function');

        t.equal(typeof position.getX, 'function', 'position.getX should be a function');
        t.equal(typeof position.getY, 'function', 'position.getY should be a function');
        t.equal(typeof position.getZ, 'function', 'position.getZ should be a function');

        t.equal(typeof position.set, 'function', 'position.set should be a function');

        t.equal(requestedUpdate, null);
        position.onUpdate();
        t.deepEqual(setPosition, [1, 1, 2]);
        t.equal(position.setX(10), position);
        t.equal(position.getX(), 10);
        t.equal(requestedUpdate, id);

        requestedUpdate = null;
        position.onUpdate();
        t.equal(requestedUpdate, null);
        t.deepEqual(setPosition, [10, 1, 2]);
        t.equal(position.setY(20), position);
        t.equal(position.getY(), 20);
        t.equal(requestedUpdate, id);

        requestedUpdate = null;
        position.onUpdate();
        t.deepEqual(setPosition, [10, 20, 2]);
        t.equal(requestedUpdate, null);
        t.equal(position.setZ(30), position);
        t.equal(position.getZ(), 30);
        t.equal(requestedUpdate, id);

        requestedUpdate = null;
        t.deepEqual(setPosition, [10, 20, 2]);
        position.onUpdate();
        t.deepEqual(setPosition, [10, 20, 30]);
        t.equal(requestedUpdate, null);

        t.equal(position.set(1, 2, 3), position);
        t.equal(position.getX(), 1);
        t.equal(position.getY(), 2);
        t.equal(position.getZ(), 3);
        t.equal(requestedUpdate, id);
    });

    t.test('halt method', function(t) {
        var position = new Position({
            addComponent: function() {},
            getPosition: function() {
                return [0, 0, 0];
            },
            requestUpdate: function() {},
            setPosition: function() {}
        });

        t.equal(typeof position.halt, 'function', 'position.halt should be a function');

        // TODO
        t.end();
    });

    t.test('onUpdate method', function(t) {
        var position = new Position({
            addComponent: function() {},
            getPosition: function() {
                return [0, 0, 0];
            },
            requestUpdate: function() {},
            setPosition: function() {}
        });

        t.equal(typeof position.onUpdate, 'function', 'position.onUpdate should be a function');

        // TODO
        t.end();
    });

    t.test('isActive method', function(t) {
        var position = new Position({
            addComponent: function() {},
            getPosition: function() {
                return [0, 0, 0];
            },
            requestUpdate: function() {},
            setPosition: function() {}
        });

        t.equal(typeof position.isActive, 'function', 'position.isActive should be a function');

        // TODO
        t.end();
    });
});
