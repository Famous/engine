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
        t.plan(1);
        var size = new Size();
        t.equal(typeof size.setProportions, 'function', 'size.setProportions should be a function');
    });

    t.test('setDifferential method', function(t) {
        t.plan(1);
        var size = new Size();
        t.equal(typeof size.setDifferential, 'function', 'size.setDifferential should be a function');
    });

    t.test('_setAbsolute method', function(t) {
        t.plan(1);
        var size = new Size();
        t.equal(typeof size._setAbsolute, 'function', 'size._setAbsolute should be a function');
    });

    t.test('setAbsolute method', function(t) {
        t.plan(1);
        var size = new Size();
        t.equal(typeof size.setAbsolute, 'function', 'size.setAbsolute should be a function');
    });

    t.test('getTopDownSize method', function(t) {
        t.plan(1);
        var size = new Size();
        t.equal(typeof size.getTopDownSize, 'function', 'size.getTopDownSize should be a function');
    });

    t.test('_update method', function(t) {
        t.plan(1);
        var size = new Size();
        t.equal(typeof size._update, 'function', 'size._update should be a function');
    });

    t.test('toIdentity method', function(t) {
        t.plan(1);
        var size = new Size();
        t.equal(typeof size.toIdentity, 'function', 'size.toIdentity should be a function');
    });
});
