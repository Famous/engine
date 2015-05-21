/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';
var test = require('tape');
var Buffer = require('../Buffer');
var TestingContext = require('./helpers/ContextWebGL');

test('Buffer', function(t) {
   t.test('constructor', function(t) {
       var testingContext = new TestingContext();

       var buffer = new Buffer(
           testingContext.ELEMENT_ARRAY_BUFFER,
           Uint16Array,
           testingContext
       );

       t.equals(buffer.target, testingContext.ELEMENT_ARRAY_BUFFER, 'should use input target');
       t.equals(buffer.type, Uint16Array, 'should use input type');
       t.equals(buffer.buffer, null, 'should not create a buffer object on instantiation');

       t.end();
   });

   t.test('subData', function(t) {
       var testingContext = new TestingContext();
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
