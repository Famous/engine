'use strict';

var test = require('tape');
var Size = require('../src/Size');

test('Size', function(t) {
    t.test('constructor', function(t) {
        t.plan(1);
        t.equal(typeof Size, 'function', 'Size should be a function');
    });

    t.test('get method', function(t) {
        t.plan(1);
        var size = new Size();
        t.equal(typeof size.get, 'function', 'size.get should be a function');
    });

    t.test('setProportions method', function(t) {
        t.plan(2);
        var size = new Size();
        t.equal(typeof size.setProportions, 'function', 'size.setProportions should be a function');

        size.setProportions(0.5, 0.5, 0.5);
        size._update(7, [100, 100, 100]);
        t.deepEqual(size.getTopDownSize(), [50, 50, 50]);
    });

    t.test('setDifferential method', function(t) {
        t.plan(3);

        var size = new Size();
        t.equal(typeof size.setDifferential, 'function', 'size.setDifferential should be a function');

        size.setDifferential(10, 10, 10);
        size._update(7, [100, 100, 100]);
        t.deepEqual(size.getTopDownSize(), [110, 110, 110]);

        size.setDifferential(-10, -10, -10);
        size._update(7, [100, 100, 100]);
        t.deepEqual(size.getTopDownSize(), [90, 90, 90]);
    });

    t.test('setAbsolute method', function(t) {
        t.plan(2);
        var size = new Size();
        t.equal(typeof size.setAbsolute, 'function', 'size.setAbsolute should be a function');

        size.setAbsolute(300, 300, 300);
        size._update(7, [100, 100, 100]);
        t.deepEqual(size.getTopDownSize(), [300, 300, 300]);
    });

    t.test('getTopDownSize method', function(t) {
        t.plan(2);
        var size = new Size();
        t.equal(typeof size.getTopDownSize, 'function', 'size.getTopDownSize should be a function');

        t.deepEqual(size.getTopDownSize(), [0, 0, 0]);
    });

    t.test('_update method', function(t) {
        t.plan(1);
        var size = new Size();
        t.equal(typeof size._update, 'function', 'size._update should be a function');
    });

    t.test('absolute height, proportional width', function(t) {
        t.plan(1);

        var size = new Size();
        size.setAbsolute(null, 300, null);
        size.setProportions(0.5, null, null);
        size._update(7, [100, 100, 100]);
        t.deepEqual(size.getTopDownSize(), [50, 300, 100]);
    });

    t.test('absolute height, proportional width, differential depth', function(t) {
        t.plan(1);

        var size = new Size();
        size.setAbsolute(null, 300, null);
        size.setProportions(0.5, null, null);
        size.setDifferential(null, null, 10);
        size._update(7, [100, 100, 100]);
        t.deepEqual(size.getTopDownSize(), [50, 300, 110]);
    });

    t.test('toIdentity method', function(t) {
        t.plan(3);
        var size = new Size();
        t.equal(typeof size.toIdentity, 'function', 'size.toIdentity should be a function');

        size.setAbsolute(100, 100, 100);
        size._update(7, [Infinity, Infinity, Infinity]);
        t.deepEqual(size.getTopDownSize(), [100, 100, 100]);
        
        size.toIdentity();
        size._update(7, [Infinity, Infinity, Infinity]);
        t.deepEqual(size.getTopDownSize(), [0, 0, 0]);
    });
});
