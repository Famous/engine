'use strict';

var test = require('tape');
var MountPoint = require('../src/MountPoint');

test('MountPoint', function(t) {
    t.test('constructor', function(t) {
        t.plan(1);
        t.equal(typeof MountPoint, 'function', 'MountPoint should be a function');
    });

    t.test('setX method', function(t) {
        t.plan(1);
        var mountPoint = new MountPoint();
        t.equal(typeof mountPoint.setX, 'function', 'mountPoint.setX should be a function');
    });

    t.test('setY method', function(t) {
        t.plan(1);
        var mountPoint = new MountPoint();
        t.equal(typeof mountPoint.setY, 'function', 'mountPoint.setY should be a function');
    });

    t.test('setZ method', function(t) {
        t.plan(1);
        var mountPoint = new MountPoint();
        t.equal(typeof mountPoint.setZ, 'function', 'mountPoint.setZ should be a function');
    });

    t.test('set method', function(t) {
        t.plan(1);
        var mountPoint = new MountPoint();
        t.equal(typeof mountPoint.set, 'function', 'mountPoint.set should be a function');
    });

    t.test('update method', function(t) {
        t.plan(2);
        var mountPoint = new  MountPoint();
        t.equal(typeof mountPoint.update, 'function', 'mountPoint.update should be a function');

        mountPoint.setX(0.1);
        mountPoint.setY(0.2);
        mountPoint.setZ(0.3);

        t.deepEqual(Array.prototype.slice.call(mountPoint.update([100, 100, 100]).getTranslation()), [-10, -20, -30]);
    });
});
