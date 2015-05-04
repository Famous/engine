'use strict';
var test = require('tape');
var Buffer = require('../src/Buffer');
var TestingContext = require('./helpers/ContextWebGL');

test('Buffer', function(t) {
   t.test('constructor', function(t) {
       var testingContext = new TestingContext();

       var spacing = 3;
       var buffer = new Buffer(
           testingContext.ELEMENT_ARRAY_BUFFER,
           Uint16Array,
           testingContext
       );

       t.equals(buffer.target, testingContext.ELEMENT_ARRAY_BUFFER, 'should use input target');
       t.equals(buffer.type, Uint16Array, 'should use input type');
       t.equals(buffer.buffer, null, 'should not create a buffer object on instantiation');

       var buffer = new Buffer(
           testingContext.ELEMENT_ARRAY_BUFFER,
           Uint16Array,
           testingContext
       );

       t.end();
   });

   t.test('subData', function(t) {
       var testingContext = new TestingContext();
       var spacing = 3;
       var buffer = new Buffer(
           testingContext.ELEMENT_ARRAY_BUFFER,
           Uint16Array,
           testingContext
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
