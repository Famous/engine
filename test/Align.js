'use strict';

var test = require('tape');
var Align = require('../src/Align');

test('Align', function(t) {
    t.test('constructor', function(t) {
        t.plan(2);
        t.equal(typeof Align, 'function', 'Align should be a function');

        t.doesNotThrow(function() {
            new Align();
        });
    });

    t.test('setX method', function(t) {
        t.plan(1);
        var align = new Align();
        t.equal(typeof align.setX, 'function', 'align.setX should be a function');
    });

    t.test('setY method', function(t) {
        t.plan(1);
        var align = new Align();
        t.equal(typeof align.setY, 'function', 'align.setY should be a function');
    });

    t.test('setZ method', function(t) {
        t.plan(1);
        var align = new Align();
        t.equal(typeof align.setZ, 'function', 'align.setZ should be a function');
    });

    t.test('set method', function(t) {
        t.plan(1);
        var align = new Align();
        t.equal(typeof align.set, 'function', 'align.set should be a function');
    });

    t.test('update method', function(t) {
        t.plan(2);
        var align = new Align();
        t.equal(typeof align.update, 'function', 'align.update should be a function');

        align.setX(0.1);
        align.setY(0.2);
        align.setZ(0.3);

        t.deepEqual(Array.prototype.slice.call(align.update([100, 100, 100]).getTranslation()), [10, 20, 30]);
    });
});
