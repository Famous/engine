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
var Mat33 = require('../Mat33');
var Vec3 = require('../Vec3');

test('Mat33', function(t) {
    t.test('constructor', function(t) {
        t.equal(typeof Mat33, 'function', 'Mat33 should be a function');

        t.doesNotThrow(function() {
            new Mat33();
        }, 'Mat33 constructor should not throw an error');

        t.end();
    });

    t.test('get method', function(t) {
        var matrix = new Mat33();
        t.equal(typeof matrix.get, 'function', 'matrix.get should be a function');
        t.deepEqual(matrix.get(), [ 1,0,0, 0,1,0, 0,0,1 ], 'Mat33 should have correct default state');
        t.end();
    });

    t.test('set method', function(t) {
        var matrix = new Mat33();
        t.equal(typeof matrix.set, 'function', 'matrix.set should be a function');

        var desired = [ 0.1,0,0, 0,0.1,0, 0,20,0.1];

        t.equal(matrix.set(desired), matrix, 'matrix.set should return matrix');
        t.deepEqual(matrix.get(), desired, 'matrix.set should set state of matrix');
        t.end();
    });

    t.test('copy method', function(t) {
        t.plan(3);
        var matrix = new Mat33();
        t.equal(typeof matrix.copy, 'function', 'matrix.copy should be a function');

        var sourceMat33 = new Mat33([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        matrix.copy(sourceMat33);

        t.deepEqual(sourceMat33.get(), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
        t.deepEqual(matrix.get(), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    t.test('vectorMultiply method', function(t) {
        var matrix = new Mat33();
        t.equal(typeof matrix.vectorMultiply, 'function', 'matrix.vectorMultiply should be a function');
        var vectors = [
            [1, 2, 3],
            [4, 5, 2]
        ];
        var matrices = [
            [ 4.1,0,4, 0,3.1,0, 0,20,0.1 ],
            [ 44,4,32, 432,31,34, 3,20,1.4 ]
        ];
        var results = [
            [16.1, 6.2, 40.3],
            [260, 1951, 114.8]
        ];

        for (var i = 0; i < matrices.length; i++) {
            var v = new Vec3(vectors[i][0], vectors[i][1], vectors[i][2]);
            var m = new Mat33(matrices[i]);
            var outputV = new Vec3();

            t.equal(m.vectorMultiply(v, outputV) instanceof Vec3, true, 'matrix.vectorMultiply should return vector');
            t.deepEqual(m.vectorMultiply(v, outputV).toArray(), results[i], 'matrix.vectorMultiply should correctly multiply a matrix with a vector');
            t.deepEqual(m.get(), matrices[i], 'matrix.vectorMultiply shouldn\'t modifiy original matrix');
            t.deepEqual(v.toArray(), vectors[i], 'matrix.vectorMultiply shouldn\'t modifiy input vector');
        }

        t.end();
    });

    t.test('multiply method', function(t) {
        var matrix = new Mat33();
        t.equal(typeof matrix.multiply, 'function', 'matrix.multiply should be a function');

        var original = [ 1,2,4, 1,6,4, 4,5,9 ];
        var expected = [ 7,24,41, 11,36,69, 25,66,108 ];

        var m = new Mat33(original);

        var result = m.multiply(new Mat33([ 5,6,7, 1,3,7, 0,3,5 ]));

        t.deepEqual(result.get(), expected, 'matrix.multiply should return result matrix');
        t.deepEqual(m.get(), original, 'matrix.multiply modifiy register');

        t.end();
    });

    t.test('transpose method', function(t) {
        var matrix = new Mat33();
        t.equal(typeof matrix.transpose, 'function', 'matrix.transpose should be a function');

        var original = [ 1,0,0, 0,1,0, 0,0,1 ];
        var transposeable = [ 1,2,0, 0,0,32, 2,4,1 ];
        var result = [ 1,0,0, 0,1,0, 0,0,1 ];

        t.deepEqual(matrix.transpose(transposeable).get(), result, 'matrix.transpose should transpose matrix');
        t.deepEqual(matrix.get(), original, 'matrix.transpose should modify register');

        t.end();
    });

    t.test('getDeterminant method', function(t) {
        t.plan(2);
        var matrix = new Mat33();
        t.equal(typeof matrix.getDeterminant, 'function', 'matrix.getDeterminant should be a function');

        matrix.set([ 1,2,3, 4,5,6, 4,8,9 ]);
        t.equal(matrix.getDeterminant(), 9);
    });

    t.test('inverse method', function(t) {
        t.plan(3);
        var matrix = new Mat33([ 1,0,0, 2,2,1, 2,0,1, 2,2,1 ]);
        t.equal(typeof matrix.inverse, 'function', 'matrix.inverse should be a function');

        var inversedMat33 = matrix.inverse();
        t.equal(inversedMat33, matrix);
        t.deepEqual(inversedMat33.get(), [1, 0, 0, 0, 0.5, -0.5, -2, 0, 1, 2, 2, 1]);
    });

    t.test('clone method', function(t) {
        t.plan(4);
        t.equal(typeof Mat33.clone, 'function', 'Mat33.clone should be a function');
        var state = [ 31,12,23, 31,23,34, 131,21,31];
        var m = new Mat33(state);
        t.deepEqual(Mat33.clone(m).get(), state, 'matrix.clone should return cloned Mat33');
        t.notEqual(Mat33.clone(m), m, 'matrix.clone should not return itself');
        t.notEqual(Mat33.clone(m).get(), m.get(), 'matrix.clone should clone deep');
    });

    t.test('inverse method', function(t) {
        t.plan(2);
        t.equal(typeof Mat33.inverse, 'function', 'Mat33.inverse should be a function');

        var mat1 = new Mat33([1, 0, 0, 0, 1, 0, 1, 2, 1]);
        var output = new Mat33();
        Mat33.inverse(mat1, output);
        t.deepEqual(output.get(), [1, 0, 0, 0, 1, 0, -1, -2, 1]);
    });

    t.test('transpose method', function(t) {
        t.plan(2);
        t.equal(typeof Mat33.transpose, 'function', 'Mat33.transpose should be a function');

        var mat1 = new Mat33([1, 0, 2, 0, 1, 1, 3, 2, 1]);
        var output = new Mat33();
        Mat33.transpose(mat1, output);
        t.deepEqual(output.get(), [1, 0, 3, 0, 1, 2, 2, 1, 1]);
    });

    t.test('add method', function(t) {
        t.plan(3);
        t.equal(typeof Mat33.add, 'function', 'Mat33.add should be a function');
        var summand1 = new Mat33([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        var summand2 = new Mat33([2, 3, 4, 5, 6, 7, 8, 9, 10]);
        var output = new Mat33();
        t.equal(Mat33.add(summand1, summand2, output), output, 'Mat33.add should return output');
        t.deepEqual(output.get(), [ 3, 5, 7, 9, 11, 13, 15, 17, 19 ], 'Mat33.add should add matrices');
    });

    t.test('subtract method', function(t) {
        t.plan(3);
        t.equal(typeof Mat33.subtract, 'function', 'Mat33.subtract should be a function');
        var mat1 = new Mat33([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        var mat2 = new Mat33([2, 3, 4, 5, 6, 7, 8, 9, 10]);
        var output = new Mat33();
        t.equal(Mat33.subtract(mat1, mat2, output), output, 'Mat33.subtract should return output');
        t.deepEqual(output.get(), [ -1,-1,-1, -1,-1,-1, -1,-1,-1 ], 'Mat33.subtract should subtract two matrices');
    });

    t.test('multiply method', function(t) {
        t.plan(3);
        t.equal(typeof Mat33.multiply, 'function', 'Mat33.multiply should be a function');
        var mat1 = new Mat33([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        var mat2 = new Mat33([2, 3, 4, 5, 6, 7, 8, 9, 10]);
        var output = new Mat33();
        t.equal(Mat33.multiply(mat1, mat2, output), output, 'Mat33.multiply should return output');
        t.deepEqual(output.get(), [ 36, 42, 48, 81, 96, 111, 126, 150, 174 ], 'Mat33.multiply should multiply two matrices');
    });
});
