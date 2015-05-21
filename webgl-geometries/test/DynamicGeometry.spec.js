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
var DynamicGeometry = require('../DynamicGeometry');
var Circle = require('../primitives/Circle');

test('DynamicGeometry', function(t) {
    t.test('constructor', function(t) {
        var geometry = new DynamicGeometry();

        t.ok(geometry.spec instanceof Object, 'should have a spec object');
        t.equal(geometry.spec.bufferNames.length, 0, 'should not have any vertex buffers by default');
        t.ok(geometry.spec.type === 'TRIANGLES', 'should have correct default draw style.');

        var indexValue = [[1, 2, 3]];
        var secondGeometry = new DynamicGeometry({
            buffers: [{ name: 'indices', data: indexValue, size: 1 }]
        });

        t.notEqual(geometry.id, secondGeometry.spec.id, 'should have unique ID');
        t.ok(secondGeometry.spec.bufferNames.indexOf('indices') !== -1, 'should pass buffer names to geometry spec');
        t.ok(secondGeometry.spec.bufferValues.indexOf(indexValue) !== -1, 'should pass buffer values to geometry spec');

        t.end();
    });

    t.test('DynamicGeometry.prototype.setVertexBuffer', function(t) {
        var geometry = new DynamicGeometry();

        t.equal(typeof geometry.setVertexBuffer, 'function', 'should be a function');
        t.throws(geometry.setVertexBuffer, 'should throw if no buffer name is provided');

        geometry.setVertexBuffer('peanutButter');

        t.equal(geometry.spec.bufferNames.length, 1, 'should create a new vertex buffer');
        t.equal(geometry.spec.bufferValues[0].length, 0, 'should default to an array of length 0');

        var jellyBuffer = [1];
        geometry.setVertexBuffer('jelly', jellyBuffer);
        t.equal(geometry.spec.bufferValues[1].length, 1, 'should use second parameter as vertex buffer value');

        var peanutButterBuffer = [1, 1];
        geometry.setVertexBuffer('peanutButter', peanutButterBuffer);
        t.equal(geometry.spec.bufferValues[0].length, 2, 'should overwrite previously assigned vertex buffer with same name');

        t.notEqual(geometry.spec.invalidations.indexOf(0), -1, 'should register invalidation for the set buffer');

        t.end();
    });

    t.test('DynamicGeometry.prototype.getVertexBuffer', function(t) {
        var geometry = new DynamicGeometry();

        t.throws(geometry.getVertexBuffer, 'should throw when no arguments are provided');

        var peanutButterBuffer = [];
        geometry.setVertexBuffer('peanutButter', peanutButterBuffer);
        t.equals(geometry.getVertexBuffer('peanutButter'), peanutButterBuffer,
        'should retreive the correct buffer data from geometry spec');

        t.end();
    });

    t.test('DynamicGeometry.prototype.setDrawType', function(t) {
        var geometry = new DynamicGeometry();

        t.throws(geometry.setDrawType, 'should throw when no argument is provided');

        geometry.setDrawType('PENANDPAPER');

        t.equals(geometry.spec.type, 'PENANDPAPER', 'should set the draw type of the spec');

        t.end();
    });

    t.test('DynamicGeometry.prototype.getLength', function(t) {
        var posAttribArray = [1, 2, 3];

        var geometry = new DynamicGeometry({
            buffers: [{
                name: 'a_pos', data: posAttribArray
            }]
        });

        t.equals(geometry.getLength(), posAttribArray.length, "Should return the length of pos attribute");
        posAttribArray.push(4);
        t.equals(geometry.getLength(), posAttribArray.length, "Should return the length of pos attribute");

        t.end();
    });

    t.test('DynamicGeometry.prototype.fromGeometry', function(t) {
        var geometry = new DynamicGeometry();
        var circleGeometry = new Circle();
        geometry.fromGeometry(circleGeometry);

        t.deepEquals(circleGeometry.spec.bufferValues, geometry.spec.bufferValues, "Should have the same data for attribute buffers");
        t.deepEquals(circleGeometry.spec.bufferNames, geometry.spec.bufferNames, "Should have the same names for attribute buffers");

        t.end();
    });

    t.test('DynamicGeometry.prototype.setVertexPositions', function(t) {
        var geometry = new DynamicGeometry();
        var vertexPositions = [0, 0, 1, 0, 1, 0, 1, 0, 0];

        geometry.setVertexPositions(vertexPositions);

        t.deepEquals(
            geometry.spec.bufferValues[geometry.spec.bufferNames.indexOf('a_pos')],
            vertexPositions,
            'Should set vertex data to the pos attribute of the geometry'
        );

        t.equals(
            geometry.spec.bufferSpacings[geometry.spec.bufferNames.indexOf('a_pos')],
            3,
            'Should set buffer spacing to 3 for pos attribute'
        );

        t.end();
    });

    t.test('DynamicGeometry.prototype.setNormals', function(t) {
        var geometry = new DynamicGeometry();
        var vertexNormals = [0, 0, 1, 0, 1, 0, 1, 0, 0];

        geometry.setNormals(vertexNormals);

        t.deepEquals(
            geometry.spec.bufferValues[geometry.spec.bufferNames.indexOf('a_normals')],
            vertexNormals,
            'Should set vertex data to the "normal" attribute of the geometry'
        );

        t.equals(
            geometry.spec.bufferSpacings[geometry.spec.bufferNames.indexOf('a_normals')],
            3,
            'Should set buffer spacing to 3 for normal attribute'
        );

        t.end();
    });

    t.test('DynamicGeometry.prototype.setTextureCoords', function(t) {
        var geometry = new DynamicGeometry();
        var textureCoords = [0, 0, 0, 1, 1, 0, 1, 1];

        geometry.setTextureCoords(textureCoords);

        t.deepEquals(
            geometry.spec.bufferValues[geometry.spec.bufferNames.indexOf('a_texCoord')],
            textureCoords,
            'Should set vertex data to the "texCoord" attribute of the geometry'
        );

        t.equals(
            geometry.spec.bufferSpacings[geometry.spec.bufferNames.indexOf('a_texCoord')],
            2,
            'Should set buffer spacing to 2 for texCoord attribute'
        );

        t.end();
    });

    t.test('DynamicGeometry.prototype.setIndices', function(t) {
        var geometry = new DynamicGeometry();
        var indices = [0, 1, 2, 3, 4, 5, 6];

        geometry.setIndices(indices);

        t.deepEquals(
            geometry.spec.bufferValues[geometry.spec.bufferNames.indexOf('indices')],
            indices,
            'Should set vertex data to the "indices" attribute of the geometry'
        );

        t.equals(
            geometry.spec.bufferSpacings[geometry.spec.bufferNames.indexOf('indices')],
            1,
            'Should set buffer spacing to 1 for indices'
        );

        t.end();
    });

    t.test('DynamicGeometry.prototype.getVertexPositions', function(t) {
        var geometry = new DynamicGeometry();
        var vertexPositions = [-1, 0, 0, 1, 0, 0];
        geometry.setVertexPositions(vertexPositions);

        t.deepEquals(
            vertexPositions,
            geometry.getVertexPositions(),
            'Should return vertex position buffer'
        );

        t.end();
    });

    t.test('DynamicGeometry.prototype.getNormals', function(t) {
        var geometry = new DynamicGeometry();
        var normals = [-1, 0, 0, 1, 0, 0];
        geometry.setNormals(normals);

        t.deepEquals(
            normals,
            geometry.getNormals(),
            'Should return normal buffer'
        );

        t.end();
    });

    t.test('DynamicGeometry.prototype.getTextureCoords', function(t) {
        var geometry = new DynamicGeometry();
        var texCoords = [0, 0, 1, 0, 0, 1, 1, 1];
        geometry.setTextureCoords(texCoords);

        t.deepEquals(
            texCoords,
            geometry.getTextureCoords(),
            'Should return texCoord buffer'
        );

        t.end();
    });

    t.end();
});
