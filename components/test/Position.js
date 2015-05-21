/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var test = require('tape');
var Position = require('../Position');

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

    t.test('prototype.toString method', function(t) {
        t.equal(typeof Position.prototype.toString, 'function', 'Position.prototype.toString should be a function');
        t.equal(Position.prototype.toString(), 'Position');
        t.end();
    });

    t.test('getValue method', function(t) {
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
        t.equal(typeof position.getValue, 'function', 'position.getValue should be a function');
        t.deepEqual(position.getValue(), {
            component: 'Position',
            x: 1,
            y: 1,
            z: 2
        });
        position.setX(4);
        position.setY(5);
        position.setZ(96);
        t.deepEqual(position.getValue(), {
            component: 'Position',
            x: 4,
            y: 5,
            z: 96
        });
        t.equal(addedComponent, position);
        t.equal(requestedUpdate, id);
        t.end();
    });

    t.test('setValue method', function(t) {
        var id = 123;
        var position = new Position({
            addComponent: function(component) {
                return id;
            },
            getPosition: function() {
                return [1, 1, 2];
            },
            requestUpdate: function(id) {
            }
        });

        t.equal(typeof position.setValue, 'function', 'position.setValue should be a function');

        var state = {
            component: 'Position',
            x: 1,
            y: 2,
            z: 3
        };
        t.equal(position.setValue(state), true, 'position.setValue should return true when passed in state is valid');
        t.deepEqual(position.getValue(), state, 'position.setValue should set new state');

        var invalidValue = {
            component: 'NotPosition',
            x: 1,
            y: 2,
            z: 3
        };
        t.equal(position.setValue(invalidValue), false, 'position.setValue should return false when passed in state is invalid');
        t.notDeepEqual(position.getValue(), invalidValue, 'position.setValue should ignore invalid states');
        t.deepEqual(position.getValue(), state, 'position.setValue should ignore invalid states');

        t.end();
    });

    t.test('basic setter and getter methods (no transitions)', function(t) {
        t.plan(30);

        var requestedUpdate = null;
        var id = 123;
        var setPosition = null;
        var position = new Position({
            addComponent: function(component) {
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

        t.equal(position.isActive(), false);
        position.setX(100, {
            duration: 1000,
            curve: function(t) {
                return t;
            }
        });
        t.equal(position.isActive(), true);

        t.end();
    });

    t.test('onUpdate, update method', function(t) {
        t.plan(5);

        var position = new Position({
            addComponent: function() {},
            getPosition: function() {
                return [0, 0, 0];
            },
            requestUpdate: function() {},
            setPosition: function(x, y, z) {
                t.equal(x, 10);
                t.equal(y, 20);
                t.equal(z, 30);
            },
            requestUpdateOnNextTick: function() {
                t.fail('position.update should check for active transition and NOT schedule requestUpdateOnNextTick');
            }
        });

        t.equal(typeof position.onUpdate, 'function', 'position.onUpdate should be a function');
        t.equal(position.onUpdate, position.update, 'position.onUpdate should be an alias of update');

        position.setX(10);
        position.setY(20);
        position.setZ(30);

        position.update();

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

        t.equal(position.isActive(), false);

        position.set(10, 20, 30, {
            duration: 500,
            curve: function(t) {
                return t;
            }
        });

        t.equal(position.isActive(), true);

        t.end();
    });
});
