'use strict';

var test = require('tape');
var Opacity = require('../src/Opacity');

test('Opacity', function(t) {
    t.test('constructor', function(t) {
        t.plan(1);
        t.equal(typeof Opacity, 'function', 'Opacity should be a function');
    });

    t.test('set method', function(t) {
        t.plan(1);
        var align = new Opacity();
        t.equal(typeof align.set, 'function', 'align.set should be a function');
    });

    t.test('setDirty method', function(t) {
        t.plan(1);
        var align = new Opacity();
        t.equal(typeof align.setDirty, 'function', 'align.setDirty should be a function');
    });

    t.test('clean method', function(t) {
        t.plan(1);
        var align = new Opacity();
        t.equal(typeof align.clean, 'function', 'align.clean should be a function');
    });
});
