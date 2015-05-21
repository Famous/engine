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
var Vec2 = require('../Vec2');

test('Vec2', function(t) {
    t.test('constructor', function(t) {
        t.equal(typeof Vec2, 'function', 'Vec2 should be a function');

        t.doesNotThrow(function() {
            new Vec2();
        });

        var vec;

        vec = new Vec2(1, 2);
        t.deepEqual(vec.toArray(), [1, 2], 'Vec2 constructor should set initial state');

        vec = new Vec2();
        t.deepEqual(vec.toArray(), [0, 0], 'Vec2 constructor should default to [0, 0]');

        vec = new Vec2(1, null);
        t.deepEqual(vec.toArray(), [1, 0], 'Vec2 constructor should default to [0, 0]');

        vec = new Vec2([1, 2]);
        t.deepEqual(vec.toArray(), [1, 2], 'Vec2 constructor should accept array');

        t.end();
    });

    t.test('set method', function(t) {
        var vector = new Vec2();
        t.equal(typeof vector.set, 'function', 'vector.set should be a function');

        var vec = new Vec2();
        vec.set(0, 0);
        t.deepEqual(vec.toArray(), [0, 0]);
        vec.set(4, 5);
        t.deepEqual(vec.toArray(), [4, 5]);
        t.end();
    });

    t.test('add method', function(t) {
        var vector = new Vec2();
        t.equal(typeof vector.add, 'function', 'vector.add should be a function');

        t.deepEqual((new Vec2(0, 1)).add(new Vec2(0, 0)).toArray(), [0, 1], 'vector.add should correctly add vectors');
        t.deepEqual((new Vec2(1, 2)).add(new Vec2(4, 5)).toArray(), [5, 7], 'vector.add should correctly add vectors');
        t.deepEqual((new Vec2(1, 1)).add(new Vec2(2, 1)).toArray(), [3, 2], 'vector.add should correctly add vectors');
        t.deepEqual((new Vec2(3, 1)).add(new Vec2(5, 7)).toArray(), [8, 8], 'vector.add should correctly add vectors');

        t.end();
    });

    t.test('subtract method', function(t) {
        var vector = new Vec2();
        t.equal(typeof vector.subtract, 'function', 'vector.subtract should be a function');

        t.deepEqual((new Vec2(0, 1)).subtract(new Vec2(0, 0)).toArray(), [0, 1], 'vector.subtract should correctly subtracttract vectors');
        t.deepEqual((new Vec2(1, 2)).subtract(new Vec2(4, 5)).toArray(), [-3, -3], 'vector.subtract should correctly subtracttract vectors');
        t.deepEqual((new Vec2(1, 1)).subtract(new Vec2(2, 1)).toArray(), [-1, 0], 'vector.subtract should correctly subtracttract vectors');
        t.deepEqual((new Vec2(3, 1)).subtract(new Vec2(5, 7)).toArray(), [-2, -6], 'vector.subtract should correctly subtracttract vectors');

        var vec1 = new Vec2(0.3, 1.1);
        var vec2 = new Vec2(1.3, 9.5);
        t.deepEqual(vec1.subtract(vec2), vec1, 'vector.subtract should be chainable');
        t.deepEqual(vec1.toArray(), [-1, -8.4], 'vector.subtract should correctly subtract vectors');
        t.deepEqual(vec2.toArray(), [1.3, 9.5], 'vector.subtract should correctly subtract vectors');

        t.end();
    });


    t.test('scale method', function(t) {
        var vector = new Vec2();
        t.equal(typeof vector.scale, 'function', 'vector.scale should be a function');

        t.deepEqual((new Vec2(0, 1)).scale(4).toArray(), [0, 4], 'vector.scale should correctly scale vectors');
        t.deepEqual((new Vec2(1, 2)).scale(2).toArray(), [2, 4], 'vector.scale should correctly scale vectors');
        t.deepEqual((new Vec2(1, 1)).scale(9).toArray(), [9, 9], 'vector.scale should correctly scale vectors');
        t.deepEqual((new Vec2(3, 1)).scale(7).toArray(), [21, 7], 'vector.scale should correctly scale vectors');

        var vec = new Vec2(0.3, 1);
        t.deepEqual(vec.scale(5.2), vec, 'vector.scale should be chainable');
        t.deepEqual(vec.toArray(), [1.56, 5.2], 'vector.scale should correctly scale vectors');

        t.end();
    });

    t.test('invert method', function(t) {
        var vector = new Vec2();
        t.equal(typeof vector.invert, 'function', 'vector.invert should be a function');

        t.deepEqual((new Vec2(0, 5)).invert(4).toArray(), [-0, -5], 'vector.invert should correctly invert vectors');
        t.deepEqual((new Vec2(3, 7)).invert(2).toArray(), [-3, -7], 'vector.invert should correctly invert vectors');
        t.deepEqual((new Vec2(2, 9)).invert(8).toArray(), [-2, -9], 'vector.invert should correctly invert vectors');
        t.deepEqual((new Vec2(1, 3)).invert(7).toArray(), [-1, -3], 'vector.invert should correctly invert vectors');

        var vec = new Vec2(0.3, 1);
        t.deepEqual(vec.invert(), vec, 'vector.invert should be chainable');
        t.deepEqual(vec.toArray(), [-0.3, -1], 'vector.invert should correctlyinvert vectors');

        t.end();
    });

    t.test('map method', function(t) {
        var vector = new Vec2();

        t.equal(typeof vector.map, 'function', 'vector.map should be a function');

        var inverse = function(value) {
            return -value;
        };

        var vec = new Vec2(1, 2);
        t.equal(vec.map(inverse), vec, 'vector.map should be chainable');
        t.deepEqual(vec.toArray(), [-1, -2], 'vector.map should map values');

        t.end();
    });

    t.test('length method', function(t) {
        var vector = new Vec2();

        t.equal(typeof vector.length, 'function', 'vector.length should be a function');

        t.equal((new Vec2(1, 1)).length(), Math.sqrt(2));
        t.equal((new Vec2(0, 0)).length(), 0);
        t.equal((new Vec2(2, 0)).length(), 2);
        t.equal((new Vec2(4, 5)).length(), Math.sqrt(41));

        var vec = new Vec2(1, 2);
        vec.length();
        t.deepEqual(vec.toArray(), [1, 2], 'vector.length should not have any side effects');

        t.end();
    });

    t.test('copy method', function(t) {
        var vector = new Vec2();
        t.equal(typeof vector.copy, 'function', 'vector.copy should be a function');

        var vec = new Vec2(3, 4);
        var sourceVec = new Vec2(6, 7);
        t.equal(vec.copy(sourceVec), vec, 'vector.copy should be chainable');
        t.deepEqual(vec.toArray(), [6, 7], 'vector.copy should correctly set state');
        t.deepEqual(sourceVec.toArray(), [6, 7], 'vector.copy should not modify source');

        t.end();
    });

    t.test('clear method', function(t) {
        var vector = new Vec2();
        t.equal(typeof vector.clear, 'function', 'vector.clear should be a function');

        var vec = new Vec2(3, 4);
        t.equal(vec.clear(), vec, 'vector.clear should be chainable');
        t.deepEqual(vec.toArray(), [0, 0], 'vector.clear should clear vector');

        t.end();
    });

    t.test('isZero method', function(t) {
        var vector = new Vec2();
        t.equal(typeof vector.isZero, 'function', 'vector.isZero should be a function');

        var vec1 = new Vec2(1, 2);
        t.equal(vec1.isZero(), false, 'vector.isZero should check if vector is zero');
        t.deepEqual(vec1.toArray(), [1, 2], 'vector.isZero should not have any side-effects');

        t.equal(new Vec2(0, 0).isZero(), true);
        t.equal(new Vec2(1, 2).isZero(), false);
        t.equal(new Vec2(1, 3).isZero(), false);
        t.equal(new Vec2(1, 0).isZero(), false);
        t.equal(new Vec2(0, 1).isZero(), false);
        t.equal(new Vec2(0, 0).isZero(), true);

        t.end();
    });

    t.test('toArray method', function(t) {
        var vector = new Vec2();
        t.equal(typeof vector.toArray, 'function', 'vector');

        var vec = new Vec2(1, 2);
        t.deepEqual(vec.toArray(), [1, 2]);
        t.end();
    });

    t.test('normalize method', function(t) {
        t.equal(typeof Vec2.normalize, 'function', 'Vec2.normalize should be a function');

        var v1 = new Vec2(10, 0);
        var output = new Vec2();

        t.equal(Vec2.normalize(v1, output), output, 'Vec2.normalize should be chainable');
        t.deepEqual(output.toArray(), [1, 0]);
        t.deepEqual(v1.toArray(), [10, 0]);

        t.end();
    });


    t.test('add method', function(t) {
        t.equal(typeof Vec2.add, 'function', 'Vec2.add should be a function');

        var v1 = new Vec2(1, 2);
        var v2 = new Vec2(9, 1);
        var output = new Vec2();

        t.equal(Vec2.add(v1, v2, output), output, 'Vec2.add should be chainable');
        t.deepEqual(output.toArray(), [10, 3]);
        t.deepEqual(v1.toArray(), [1, 2]);
        t.deepEqual(v2.toArray(), [9, 1]);

        t.end();
    });

    t.test('subtract method', function(t) {
        t.equal(typeof Vec2.subtract, 'function', 'Vec2.subtract should be a function');

        var v1 = new Vec2(1, 2);
        var v2 = new Vec2(9, 1);
        var output = new Vec2();

        t.equal(Vec2.subtract(v1, v2, output), output, 'Vec2.subtract should be chainable');
        t.deepEqual(output.toArray(), [-8, 1]);
        t.deepEqual(v1.toArray(), [1, 2]);
        t.deepEqual(v2.toArray(), [9, 1]);

        t.end();
    });

    t.test('scale method', function(t) {
        t.equal(typeof Vec2.scale, 'function', 'Vec2.scale should be a function');

        var v = new Vec2(1, 3);
        var s = 5;
        var output = new Vec2();

        t.equal(Vec2.scale(v, s, output), output, 'Vec2.scale should be chainable');
        t.deepEqual(output.toArray(), [5, 15]);
        t.deepEqual(v.toArray(), [1, 3]);

        t.end();
    });

    t.test('clone method', function(t) {
        var sourceVec2 = new Vec2();
        t.equal(typeof Vec2.clone, 'function', 'Vec2.clone should be a function');

        var clonedVec2 = Vec2.clone(sourceVec2);

        t.notEqual(sourceVec2, clonedVec2);
        t.deepEqual(sourceVec2, clonedVec2);
        t.end();
    });
});
