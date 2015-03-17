'use strict';

var test = require('tape');
var ObjectManager = require('famous-utilities').ObjectManager;

var TestObj = function(x) {this.x = x;};
var _request = function(pool) {
    return function request(x) {
        if (pool.length) return pool.pop();
        else return new TestObj(x);
    }
};
var _free = function(pool) {
    return function free(obj) {
        pool.push(obj);
    }
};

test('ObjectManager', function(t) {
    t.test('should be a singleton', function(t) {
        t.equal(ObjectManager instanceof Function, false, 'ObjectManager should not be a constructor');
        t.equal(ObjectManager instanceof Object, true, 'ObjectManager should be an Object');

        t.end();
    });

    t.test('pools property', function(t) {
        t.assert(!!ObjectManager.pools, 'ObjectManager should have a pools property');
        t.assert(ObjectManager.pools instanceof Object, 'ObjectManager.pools should be an Object');

        t.end();
    });

    t.test('register method', function(t) {
        t.assert(ObjectManager.register instanceof Function, 'ObjectManager.register should be a function');

        ObjectManager.register('TestObj', _request, _free);

        t.assert(ObjectManager.pools.TestObj instanceof Array, 'should have a TestObj pool');
        t.assert(ObjectManager.requestTestObj instanceof Function, 'should have registered a TestObj request Function');
        t.assert(ObjectManager.freeTestObj instanceof Function, 'should have registered a TestObj free Function');

        t.end();
    });

    t.test('disposeOf method', function(t) {
        t.assert(ObjectManager.disposeOf instanceof Function, 'ObjectManager.disposeOf should be a function');

        var a = new TestObj(1);
        var b = new TestObj(2);

        ObjectManager.freeTestObj(a);
        ObjectManager.freeTestObj(b);

        t.assert(ObjectManager.pools.TestObj.length === 2, 'TestObj pool should have two elements before disposal');
        ObjectManager.disposeOf('TestObj');
        t.assert(ObjectManager.pools.TestObj.length === 0, 'TestObj pool should have no elements after disposal');

        t.end();
    });

    t.end();
});