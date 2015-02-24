'use strict';

var test = require('tape');
var ElementAllocator = require('../src/ElementAllocator');

test('ElementAllocator', function(t) {
    t.test('constructor', function(t) {
        t.plan(1);
        t.doesNotThrow(function() {
            new ElementAllocator();
        });
    });

    t.test('allocate method', function(t) {
        t.plan(1);
        var elementAllocator = new ElementAllocator();
        t.equal(typeof elementAllocator.allocate, 'function', 'elemenAllocator.allocate should be a function');
    });

    t.test('deallocate method', function(t) {
        t.plan(1);
        var elementAllocator = new ElementAllocator();
        t.equal(typeof elementAllocator.deallocate, 'function', 'elemenAllocator.deallocate should be a function');
    });

    t.test('getNodeCount method', function(t) {
        t.plan(1);
        var elementAllocator = new ElementAllocator();
        t.equal(typeof elementAllocator.getNodeCount, 'function', 'elemenAllocator.getNodeCount should be a function');
    });
});
