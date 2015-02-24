'use strict';

var test = require('tape');
var Origin = require('../src/Origin');

test('Origin', function(t) {
    t.test('constructor', function(t) {
        t.plan(1);
        t.equal(typeof Origin, 'function', 'Origin should be a function');
    });

    t.test('_setWithoutActivating method', function(t) {
        t.plan(1);
        var align = new Origin();
        t.equal(typeof align._setWithoutActivating, 'function', 'align._setWithoutActivating should be a function');
    });

    t.test('set method', function(t) {
        t.plan(1);
        var align = new Origin();
        t.equal(typeof align.set, 'function', 'align.set should be a function');
    });

    t.test('setDirty method', function(t) {
        t.plan(1);
        var align = new Origin();
        t.equal(typeof align.setDirty, 'function', 'align.setDirty should be a function');
    });

    t.test('clean method', function(t) {
        t.plan(1);
        var align = new Origin();
        t.equal(typeof align.clean, 'function', 'align.clean should be a function');
    });
});
