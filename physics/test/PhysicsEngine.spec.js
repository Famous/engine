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
var PhysicsEngine = require('../PhysicsEngine');
var Particle = require('../bodies/Particle');

test('PhysicsEngine', function(t) {
    var world = new PhysicsEngine();

    t.test('should be a constructor', function(t) {
        t.assert(PhysicsEngine instanceof Function, 'PhysicsEngine should be a function');

        t.end();
    });

    t.test('event methods', function(t) {
        t.assert(world.events, '.events should exist');
        t.assert(world.on instanceof Function, '.on should be a function');
        t.assert(world.off instanceof Function, '.off should be a function');
        t.assert(world.trigger instanceof Function, '.trigger should be a function');

        t.end();
    });

    t.test('should track bodies correctly', function(t) {
        t.assert(world.bodies instanceof Array, 'instances of PhysicsEngine should have a body array');
        t.assert(world._indexPools.bodies instanceof Array, 'instances of PhysicsEngine should have a body ID pool');
        t.assert(world._entityMaps.bodies instanceof Object, 'instances of PhysicsEngine should have a body index map');

        var dummyBody1 = {_ID: null};
        var dummyBody2 = {_ID: null};
        var dummyBody3 = {_ID: null};
        t.test('add and remove methods', function(t) {
            t.assert(world.addBody instanceof Function, '.addBody should be a Function');
            world.addBody(dummyBody1);
            t.assert(world.bodies[0] === dummyBody1, '.addBody should push to the .bodies array');
            t.assert(world._entityMaps.bodies[dummyBody1._ID] === 0, '.addBody should track the index');

            world.addBody(dummyBody2);
            t.assert(world.removeBody instanceof Function, '.removeBody should be a Function');
            var index = world._entityMaps.bodies[dummyBody1._ID];
            world.removeBody(dummyBody1);
            t.assert(world.bodies[index] === null, '.removeBody set the element at the index to null');
            t.assert(world._entityMaps.bodies[dummyBody1._ID] === null, '.removeBody should null the index map');

            world.addBody(dummyBody3);
            t.assert(world.bodies[index] === dummyBody3, '.addBody should fill in null\'d spaces of the array');
            t.assert(world._entityMaps.bodies[dummyBody3._ID] === index, '.addBody should recycle indices');

            t.end();
        });

        t.end();
    });

    t.test('should track forces correctly', function(t) {
        t.assert(world.forces instanceof Array, 'instances of PhysicsEngine should have a force array');
        t.assert(world._indexPools.forces instanceof Array, 'instances of PhysicsEngine should have a force ID pool');
        t.assert(world._entityMaps.forces instanceof Object, 'instances of PhysicsEngine should have a force index map');

        var dummyForce1 = {_ID: null};
        var dummyForce2 = {_ID: null};
        var dummyForce3 = {_ID: null};
        t.test('add and remove methods', function(t) {
            t.assert(world.addForce instanceof Function, '.addForce should be a Function');
            world.addForce(dummyForce1);
            t.assert(world.forces[0] === dummyForce1, '.addForce should push to the .forces array');
            t.assert(world._entityMaps.forces[dummyForce1._ID] === 0, '.addForce should track the index');

            world.addForce(dummyForce2);
            t.assert(world.removeForce instanceof Function, '.removeForce should be a Function');
            var index = world._entityMaps.forces[dummyForce1._ID];
            world.removeForce(dummyForce1);
            t.assert(world.forces[index] === null, '.removeForce set the element at the index to null');
            t.assert(world._entityMaps.forces[dummyForce1._ID] === null, '.removeForce should null the index map');

            world.addForce(dummyForce3);
            t.assert(world.forces[index] === dummyForce3, '.addForce should fill in null\'d spaces of the array');
            t.assert(world._entityMaps.forces[dummyForce3._ID] === index, '.addForce should recycle indices');

            t.end();
        });

        t.end();
    });

    t.test('should track constraints correctly', function(t) {
        t.assert(world.constraints instanceof Array, 'instances of PhysicsEngine should have a constraint array');
        t.assert(world._indexPools.constraints instanceof Array, 'instances of PhysicsEngine should have a constraint ID pool');
        t.assert(world._entityMaps.constraints instanceof Object, 'instances of PhysicsEngine should have a constraint index map');

        var dummyConstraint1 = {_ID: null};
        var dummyConstraint2 = {_ID: null};
        var dummyConstraint3 = {_ID: null};
        t.test('add and remove methods', function(t) {
            t.assert(world.addConstraint instanceof Function, '.addConstraint should be a Function');
            world.addConstraint(dummyConstraint1);
            t.assert(world.constraints[0] === dummyConstraint1, '.addConstraint should push to the .constraints array');
            t.assert(world._entityMaps.constraints[dummyConstraint1._ID] === 0, '.addConstraint should track the index');

            world.addConstraint(dummyConstraint2);
            t.assert(world.removeConstraint instanceof Function, '.removeBody should be a Function');
            var index = world._entityMaps.constraints[dummyConstraint1._ID];
            world.removeConstraint(dummyConstraint1);
            t.assert(world.constraints[index] === null, '.removeConstraint set the element at the index to null');
            t.assert(world._entityMaps.constraints[dummyConstraint1._ID] === null, '.removeConstraint should null the index map');

            world.addConstraint(dummyConstraint3);
            t.assert(world.constraints[index] === dummyConstraint3, '.addConstraint should fill in null\'d spaces of the array');
            t.assert(world._entityMaps.constraints[dummyConstraint3._ID] === index, '.addConstraint should recycle indices');

            t.end();
        });

        t.end();
    });

    t.test('update method', function(t) {
        t.assert(world.update instanceof Function, '.update should be a Function');

        world.bodies = [];
        world.forces = [];
        world.constraints = [];
        world._indexPools = {
            bodies: [],
            forces: [],
            constraints: []
        };

        world.iterations = 13;
        world.step = 16.6;

        var testBody = new Particle();
        var fu = 0;
        var testForce = {
            _ID: 0,
            update: function() {
                fu++;
            }
        };
        var cu = 0;
        var cr = 0;
        var testConstraint = {
            _ID: 0,
            update: function() {
                cu++;
            },
            resolve: function() {
                cr++;
            }
        };

        world.addBody(testBody);
        world.addForce(testForce);
        world.addConstraint(testConstraint);

        world.update(100);
        t.assert(!fu && !cu && !cr, '.update should not step forward when first called');
        world.update(115);
        t.assert(!fu && !cu && !cr, '.update should not step forward when the time delta is less than .step');
        world.update(117);
        t.assert(fu === 1 && cu === 1, '.update should step forward when total time unaccounted for is larger than .step');
        t.assert(cr === 13, '.update should call .resolve on constraints once per .iterations');
        world.update(151);
        t.assert(cr === 39 && fu === 3 && cu === 3, '.update should step forward multiple times when the total time unaccounted for is multiple times larger than .step');

        t.end();
    });

    t.end();
});
