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
var BufferRegistry = require('../BufferRegistry');
var TestingContext = require('./helpers/ContextWebGL');
var Buffer = require('../Buffer');

test('BufferRegistry', function(t) {

    var registry;
    var geometry = {
        spec: {
            id: 0,
            dynamic: false,
            type: 4,
            bufferNames: [
                'pos', 'texCoord', 'normals', 'indices'
            ],
            bufferValues: [
                [-1, 1, 0, 0, -1, 0, 1,  1, 0],
                [0.0, 0.0, 0.5, 1.0, 1.0, 0.0],
                [0, 0, 1, 0, 0, 1, 0, 0, 1],
                [0, 1, 2]
            ],
            bufferSpacings: [
                3, 2, 3, 1
            ],
            invalidations: [
                0, 1, 2, 3
            ]
        }
    };

    t.test('constructor', function(t) {
        var testingContext = new TestingContext();

        registry = new BufferRegistry(testingContext);

        t.end();
    });

    t.test('allocate', function(t) {
        var bufferData = geometry.spec.bufferValues[0];
        registry.allocate(geometry.spec.id, 'pos', geometry.spec.bufferValues[0], 3);

        var entry = registry.registry[geometry.spec.id];
        t.ok(entry, 'Should create an object in registry accessed by geometry id');

        t.ok(Array.isArray(entry.keys), 'Should have an array for buffer keys');
        t.ok(Array.isArray(entry.values), 'Should have an array for buffer values');
        t.ok(Array.isArray(entry.spacing), 'Should have an array for buffer spacings');
        t.ok(Array.isArray(entry.offset), 'Should have an array for buffer offsets');
        t.ok(Array.isArray(entry.length), 'Should have an array for buffer lengths');

        t.ok(registry._staticBuffers[0], 'Should have an a static buffer entry');
        t.equals(bufferData.length, registry._staticBuffers[0].offset, 'Should set correct offset');
        t.ok(registry._staticBuffers[0].buffer instanceof Buffer, 'Should have reference to a created buffer instance');
        t.ok(!registry._staticBuffers.isIndex, 'isIndex should be set to false for non-indices buffers');

        t.equals(registry._staticBuffers.length, 1, 'Buffers should be shared for static geometries');

        registry.allocate(geometry.spec.id, 'texCoord', geometry.spec.bufferValues[1], 2);

        t.equals(
            registry._staticBuffers[0].offset,
            geometry.spec.bufferValues[0].length + 
            geometry.spec.bufferValues[1].length,
            'Offset should be both bufferValue lengths added together'
        );

        registry.allocate(geometry.spec.id, 'indices', geometry.spec.bufferValues[0], 1);

        t.equals(registry._staticBuffers.length, 2, 'Indices should always get their own buffers');

        // Dynamic buffers

        geometry.spec.id++;

        registry.allocate(geometry.spec.id, 'pos', geometry.spec.bufferValues[0], 3, true);
        registry.allocate(geometry.spec.id, 'texCoord', geometry.spec.bufferValues[1], 2, true);
        registry.allocate(geometry.spec.id, 'normals', geometry.spec.bufferValues[2], 3, true);

        t.equals(registry._dynamicBuffers.length, 3, 'Dynamic attributes should always get their own buffers');

        t.end();
    });

    t.end();
});
