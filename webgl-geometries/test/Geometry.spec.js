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
var Geometry = require('../Geometry');

test('Geometry', function(t) {
    t.test('constructor', function(t) {
        var geometry = new Geometry();

        t.ok(geometry.spec instanceof Object, 'should have a spec object');
        t.equal(geometry.spec.bufferNames.length, 0, 'should not have any vertex buffers by default');
        t.ok(geometry.spec.type === 'TRIANGLES', 'should have correct default draw style.');

        var indexValue = [[1, 2, 3]];
        var secondGeometry = new Geometry({
        	buffers: [{ name: 'indices', data: indexValue, size: 1 }]
        });

        t.notEqual(geometry.spec.id, secondGeometry.spec.id, 'should have unique ID');
        t.ok(secondGeometry.spec.bufferNames.indexOf('indices') !== -1, 'should pass buffer names to geometry spec');
        t.ok(secondGeometry.spec.bufferValues.indexOf(indexValue) !== -1, 'should pass buffer values to geometry spec');

        t.end();
    });

    t.end();
});
