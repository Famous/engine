'use strict';

var test = require('tape');
var Opacity = require('../src/Opacity');

test('Opacity', function(t) {
    t.test('constructor', function(t) {
        t.equal(typeof Opacity, 'function', 'Opacity should be a function');

        var opacity = new Opacity();
        t.equal(opacity.isActive, false);
        t.equal(opacity.dirty, false);

        t.end();
    });

    t.test('set method', function(t) {
        var opacity = new Opacity();
        t.equal(typeof opacity.set, 'function', 'opacity.set should be a function');

        t.equal(opacity.set(0.1), opacity, 'opacity.set should be chainable');
        t.equal(opacity.value, 0.1);
        t.equal(opacity.dirty, true, 'opacity.set should dirty the opacity');

        opacity.clean();
        t.equal(opacity.dirty, false);

        opacity.set(0.9);
        t.equal(opacity.value, 0.9);
        t.equal(opacity.dirty, true);

        t.end();
    });

    t.test('setDirty method', function(t) {
        var opacity = new Opacity();
        t.equal(typeof opacity.setDirty, 'function', 'opacity.setDirty should be a function');

        t.equal(opacity.setDirty(), opacity, 'opacity.setDirty should be chainable');
        t.equal(opacity.dirty, true);
        opacity.clean();
        t.equal(opacity.dirty, false);

        t.end();
    });

    t.test('clean method', function(t) {
        var opacity = new Opacity();
        t.equal(typeof opacity.clean, 'function', 'opacity.clean should be a function');

        t.equal(opacity.clean(), opacity, 'opacity.clean should be chainable');
        t.end();
    });
});
