'use strict';

var test = require('tape');
var PhysicsEngine = require('../src/PhysicsEngine');

test('PhysicsEngine', function(t) {
    var world = new PhysicsEngine();

    t.test('should be a constructor', function(t) {
        t.assert(PhysicsEngine instanceof Function, 'PhysicsEngine should be a function');

        t.end();
    });

    t.test('should track bodies correctly', function(t) {
        t.assert(world.bodies instanceof Array, 'instances of PhysicsEngine should have a body array');
        t.assert(world._indexPools.bodies instanceof Array, 'instances of PhysicsEngine should have a body ID pool');

        var dummyBody1 = {_ID: null};
        var dummyBody2 = {_ID: null};
        var dummyBody3 = {_ID: null};
        t.test('add and remove methods', function(t) {
            t.assert(world.addBody instanceof Function, '.addBody should be a Function');
            world.addBody(dummyBody1);
            t.assert(world.bodies[0] === dummyBody1, '.addBody should push to the .bodies array');
            t.assert(dummyBody1._ID === 0, '.addBody should assign an ID');

            world.addBody(dummyBody2);
            t.assert(world.removeBody instanceof Function, '.removeBody should be a Function');
            var id = dummyBody1._ID;
            world.removeBody(dummyBody1);
            t.assert(world.bodies[id] === null, '.removeBody set the element at the ID to null');
            t.assert(dummyBody1._ID === null, '.removeBody should null the ID');

            world.addBody(dummyBody3);
            t.assert(world.bodies[id] === dummyBody3, '.addBody should fill in null\'d spaces of the array');
            t.assert(dummyBody3._ID === id, '.addBody should recycle IDs');

            t.end();
        });

        t.end();
    });

    t.test('should track forces correctly', function(t) {
        t.assert(world.forces instanceof Array, 'instances of PhysicsEngine should have a force array');
        t.assert(world._indexPools.forces instanceof Array, 'instances of PhysicsEngine should have a force ID pool');

        var dummyForce1 = {_ID: null};
        var dummyForce2 = {_ID: null};
        var dummyForce3 = {_ID: null};
        t.test('add and remove methods', function(t) {
            t.assert(world.addForce instanceof Function, '.addForce should be a Function');
            world.addForce(dummyForce1);
            t.assert(world.forces[0] === dummyForce1, '.addForce should push to the .forces array');
            t.assert(dummyForce1._ID === 0, '.addForce should assign an ID');

            world.addForce(dummyForce2);
            t.assert(world.removeForce instanceof Function, '.removeForce should be a Function');
            var id = dummyForce1._ID;
            world.removeForce(dummyForce1);
            t.assert(world.forces[id] === null, '.removeForce set the element at the ID to null');
            t.assert(dummyForce1._ID === null, '.removeForce should null the ID');

            world.addForce(dummyForce3);
            t.assert(world.forces[id] === dummyForce3, '.addForce should fill in null\'d spaces of the array');
            t.assert(dummyForce3._ID === id, '.addForce should recycle IDs');

            t.end();
        });

        t.end();
    });

    t.test('should track constraints correctly', function(t) {
        t.assert(world.constraints instanceof Array, 'instances of PhysicsEngine should have a constraint array');
        t.assert(world._indexPools.constraints instanceof Array, 'instances of PhysicsEngine should have a constraint ID pool');

        var dummyConstraint1 = {_ID: null};
        var dummyConstraint2 = {_ID: null};
        var dummyConstraint3 = {_ID: null};
        t.test('add and remove methods', function(t) {
            t.assert(PhysicsEngine.addConstraint instanceof Function, '.addConstraint should be a Function');
            world.addConstraint(dummyConstraint1);
            t.assert(world.constraints[0] === dummyConstraint1, '.addConstraint should push to the .constraints array');
            t.assert(dummyConstraint1._ID === 0, '.addConstraint should assign an ID');

            world.addConstraint(dummyConstraint2);
            t.assert(world.removeConstraint instanceof Function, '.removeConstraint should be a Function');
            var id = dummyConstraint1._ID;
            world.removeConstraint(dummyConstraint1);
            t.assert(world.constraints[id] === null, '.removeConstraint set the element at the ID to null');
            t.assert(dummyConstraint1._ID === null, '.removeConstraint should null the ID');

            world.addConstraint(dummyConstraint3);
            t.assert(world.constraints[id] === dummyConstraint3, '.addConstraint should fill in null\'d spaces of the array');
            t.assert(dummyConstraint3._ID === id, '.addConstraint should recycle IDs');

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

        var iv = 0;
        var ip = 0;
        var testBody = {_ID: null, _integrateVelocity: function() {iv++;}, _integratePose: function() {ip++;}};
        var fu = 0;
        var testForce = {_ID: null, update: function() {fu++;}};
        var cu = 0;
        var cr = 0;
        var testConstraint = {_ID: null, update: function() {cu++;}, resolve: function() {cr++;}};

        world.addBody(testBody);
        world.addForce(testForce);
        world.addConstraint(testConstraint);

        world.update(100);
        t.assert(!iv && !ip && !fu && !cu && !cr, '.update should not step forward when first called');
        world.update(115);
        t.assert(!iv && !ip && !fu && !cu && !cr, '.update should not step forward when the time delta is less than .step');
        world.update(117);
        t.assert(iv === 1 && ip === 1 && fu === 1 && cu === 1, '.update should step forward when total time unaccounted for is larger than .step');
        t.assert(cr === 13, '.update should call .resolve on constraints once per .iterations');
        world.update(151);
        t.assert(cr === 39 && iv === 3 && ip === 3 && fu === 3 && cu === 3, '.update should step forward multiple times when the total time unaccounted for is multiple times larger than .step');

        t.end();
    });

    t.end();
});