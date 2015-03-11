'use strict';

var test = require('tape');
var Origin = require('../src/Origin');

test('Origin', function(t) {
    t.test('constructor', function(t) {
        t.equal(typeof Origin, 'function', 'Origin should be a function');

        var origin = new Origin();
        t.equal(origin.dirty, false);
        t.equal(origin.isActive, false);

        t.end();
    });

    t.test('_setWithoutActivating method', function(t) {
        var origin = new Origin();
        t.equal(typeof origin._setWithoutActivating, 'function', 'origin._setWithoutActivating should be a function');

        t.equal(origin._setWithoutActivating(1, 2, 3), origin, 'origin._setWithoutActivating should be chainable');
        t.equal(origin.isActive, false);
        t.end();
    });

    t.test('set method', function(t) {
        var origin = new Origin();
        t.equal(typeof origin.set, 'function', 'origin.set should be a function');

        t.equal(origin.set(4, 5, 1996), origin, 'origin.set should be chainable');
        t.equal(origin.dirty, true);
        origin.clean();
        t.equal(origin.dirty, false);

        origin.set(4, 5, 1996);
        t.equal(origin.dirty, false);
        
        origin.set(5, 5, 1996);
        t.equal(origin.dirty, true);
        
        origin.clean();
        t.equal(origin.dirty, false);

        origin.set(undefined, undefined, 1996);
        t.equal(origin.dirty, false);        

        t.end();
    });

    t.test('setDirty method', function(t) {
        var origin = new Origin();
        t.equal(typeof origin.setDirty, 'function', 'origin.setDirty should be a function');

        t.equal(origin.dirty, false);

        t.equal(origin.setDirty(), origin, 'origin.setDirty should be chainable');
        t.equal(origin.dirty, true);

        t.end();
    });

    t.test('clean method', function(t) {
        var origin = new Origin();
        t.equal(typeof origin.clean, 'function', 'origin.clean should be a function');

        origin.setDirty();
        t.equal(origin.clean(), origin, 'origin.clean should be chainable');

        t.end();
    });
});
