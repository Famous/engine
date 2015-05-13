'use strict';

var test = require('tape');
var Pool = require('../Pool');

test('Pool', function(t) {
    t.test('constructor', function(t) {
        t.equal(
            typeof Pool,
            'function',
            'Pool should be a constructor function'
        );
        t.doesNotThrow(function() {
            new Pool();
        }, 'Instantiating a new pool should not require any arguments');
        t.end();
    });
    
    
    t.test('allocate method', function(t) {
        t.test('Initial allocation', function(t) {
            t.plan(2);
            var pool = new Pool();
            
            t.equal(
                typeof pool.allocate,
                'function',
                'pool.allocate should be a function'
            );
            
            var expectedOptions = {};
            var Constructor0 = function(actualOptions) {
                t.equal(
                    actualOptions,
                    expectedOptions,
                    'Pool should create new object with passed in objects on ' +
                    'initial allocation'
                );
            };
            
            pool.allocate(Constructor0, expectedOptions);
        });
    });
});
