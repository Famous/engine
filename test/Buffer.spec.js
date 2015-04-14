'use strict';
var test = require('tape');
var Buffer = require('../src/BufferRegistry');
var TestingContext = require('./WebGLTestingContext');

test('Buffer', function(t) {
   t.test('constructor', function(t) {
       var testingContext = new TestingContext();
       var spacing = 3;
       var buffer = new Buffer(
           testingContext.ELEMENT_ARRAY_BUFFER,
           Uint16Array,
           testingContext,
           spacing
       );

       t.ok(buffer.spacing === 3, 'should use input spacing');
       t.ok(buffer.target === testingContext.ELEMENT_ARRAY_BUFFER, 'should use input target');
       t.ok(buffer.buffer === null, 'should not create a buffer object on instantiation');

       var buffer = new Buffer(
           testingContext.ELEMENT_ARRAY_BUFFER,
           Uint16Array,
           testingContext
       );

       t.ok(buffer.spacing === 0, 'should default to 0 spacing for buffer');

       t.end();
   });

   t.test('constructor', function(t) {
       var testingContext = new TestingContext();
       var spacing = 3;
       var buffer = new Buffer(
           testingContext.ELEMENT_ARRAY_BUFFER,
           Uint16Array,
           testingContext,
           spacing
       );

       t.ok(buffer.subData instanceof Function, 'should have an subData method');

       buffer.subData();
       t.ok(testingContext.createBuffer.callCount === 1, 'should call createBuffer if no buffer currently exists');
       t.ok(testingContext.bindBuffer.callCount === 1, 'should call bindBuffer on the context');

       buffer.subData();
       t.ok(testingContext.createBuffer.callCount === 1, 'should not call createBuffer if buffer currently exists');

       t.end();
   });

   t.end();
});
