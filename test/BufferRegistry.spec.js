'use strict';
var test = require('tape');
var BufferRegistry = require('../src/BufferRegistry');
var TestingContext = require('./WebGLTestingContext');

test('BufferRegistry', function(t) {

    var registry;
    var geometry = {};
   t.test('constructor', function(t) {
       var testingContext = new TestingContext();

       registry = new BufferRegistry(testingContext);

       t.end();
   });

    t.test('allocate', function(t) {

        registry.allocate(geometry.id, 'pos', geometry.spec.bufferValues[0], 3);
        registry.allocate(geometry.id, 'texCoord', geometry.spec.bufferValues[1], 2);
        registry.allocate(geometry.id, 'normals', geometry.spec.bufferValues[2], 3);
        registry.allocate(geometry.id, 'indices', geometry.spec.bufferValues[3], 1);

        t.end();
    });

   t.end();
});
