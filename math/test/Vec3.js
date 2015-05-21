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
var Vec3 = require('../Vec3');

var MockMatrix = function(value) {
    this._value = value.slice();
};

MockMatrix.prototype.get = function() {
    return this._value;
};

test('Vec3', function(t) {
    t.test('constructor', function(t) {
        t.equal(typeof Vec3, 'function', 'Vec3 should be a function');

        t.doesNotThrow(function() {
            new Vec3();
        });

        var vec1 = new Vec3(1, 2, 3);
        t.deepEqual(vec1.toArray(), [1, 2, 3], 'Vec3 constructor should set initial state');

        var vec2 = new Vec3();
        t.deepEqual(vec2.toArray(), [0, 0, 0], 'Vec3 constructor should defualt to [0, 0, 0]');

        var vec3 = new Vec3(1, null, 3);
        t.deepEqual(vec3.toArray(), [1, 0, 3], 'Vec3 constructor should defualt to [0, 0, 0]');

        t.end();
    });

    t.test('set method', function(t) {
        var vector = new Vec3();
        t.equal(typeof vector.set, 'function', 'vector.set should be a function');

        var vec = new Vec3();
        vec.set(0, 0, 0);
        t.deepEqual(vec.toArray(), [0, 0, 0]);
        vec.set(4, 5, 6);
        t.deepEqual(vec.toArray(), [4, 5, 6]);
        t.end();
    });

    t.test('add method', function(t) {
        var vector = new Vec3();
        t.equal(typeof vector.add, 'function', 'vector.add should be a function');

        t.deepEqual((new Vec3(0, 1, 0)).add(new Vec3(0, 0, 1)).toArray(), [0, 1, 1], 'vector.add should correctly add vectors');
        t.deepEqual((new Vec3(1, 2, 3)).add(new Vec3(4, 5, 6)).toArray(), [5, 7, 9], 'vector.add should correctly add vectors');
        t.deepEqual((new Vec3(1, 1, 1)).add(new Vec3(2, 1, 1)).toArray(), [3, 2, 2], 'vector.add should correctly add vectors');
        t.deepEqual((new Vec3(3, 1, 2)).add(new Vec3(5, 7, 1)).toArray(), [8, 8, 3], 'vector.add should correctly add vectors');

        var vec1 = new Vec3(0.3, 1.1, 0);
        var vec2 = new Vec3(1.3, 9.5, 1.7);
        t.equal(vec1.add(vec2), vec1, 'vector.add should correctly add vectors');
        t.deepEqual(vec1.toArray(), [1.6, 10.6, 1.7], 'vector.add should correctly add vectors');
        t.deepEqual(vec2.toArray(), [1.3, 9.5, 1.7]);

        t.end();
    });

    t.test('subtract method', function(t) {
        var vector = new Vec3();
        t.equal(typeof vector.subtract, 'function', 'vector.subtract should be a function');

        t.deepEqual((new Vec3(0, 1, 0)).subtract(new Vec3(0, 0, 1)).toArray(), [0, 1, -1], 'vector.subtract should correctly subtracttract vectors');
        t.deepEqual((new Vec3(1, 2, 3)).subtract(new Vec3(4, 5, 6)).toArray(), [-3, -3, -3], 'vector.subtract should correctly subtracttract vectors');
        t.deepEqual((new Vec3(1, 1, 1)).subtract(new Vec3(2, 1, 1)).toArray(), [-1, 0, 0], 'vector.subtract should correctly subtracttract vectors');
        t.deepEqual((new Vec3(3, 1, 2)).subtract(new Vec3(5, 7, 1)).toArray(), [-2, -6, 1], 'vector.subtract should correctly subtracttract vectors');

        var vec1 = new Vec3(0.3, 1.1, 0);
        var vec2 = new Vec3(1.3, 9.5, 1.7);
        t.deepEqual(vec1.subtract(vec2), vec1, 'vector.subtract should be chainable');
        t.deepEqual(vec1.toArray(), [-1, -8.4, -1.7], 'vector.subtract should correctly subtract vectors');
        t.deepEqual(vec2.toArray(), [1.3, 9.5, 1.7], 'vector.subtract should correctly subtract vectors');

        t.end();
    });

    // t.test('rotateX method', function(t) {
    //     var vector = new Vec3();
    //     t.equal(typeof vector.rotateX, 'function', 'vector.rotateX should be a function');

    //     var vec1 = new Vec3(1, 4, 7);
    //     t.equal(vec1.rotateX(Math.PI), vec1, 'vector.rotateX should be chainable');
    //     t.deepEqual(deepRound(vec1.toArray()), [1, -4, -7]);

    //     var vec2 = new Vec3(1, 4, 7);
    //     t.equal(vec2.rotateX(Math.PI*0.5), vec2, 'vector.rotateX should be chainable');
    //     t.deepEqual(deepRound(vec2.toArray()), [1, -7, 4]);

    //     t.end();
    // });

    // t.test('rotateY method', function(t) {
    //     var vector = new Vec3();
    //     t.equal(typeof vector.rotateY, 'function', 'vector.rotateY should be a function');

    //     var vec1 = new Vec3(1, 4, 7);
    //     t.equal(vec1.rotateY(Math.PI), vec1, 'vector.rotateY should be chainable');
    //     t.deepEqual(deepRound(vec1.toArray()), [-1, 4, -7]);

    //     var vec2 = new Vec3(1, 4, 7);
    //     t.equal(vec2.rotateY(Math.PI*0.5), vec2, 'vector.rotateY should be chainable');
    //     t.deepEqual(deepRound(vec2.toArray()), [7, 4, -1]);

    //     t.end();
    // });

    // t.test('rotateZ method', function(t) {
    //     var vector = new Vec3();
    //     t.equal(typeof vector.rotateZ, 'function', 'vector.rotateZ should be a function');

    //     var vec1 = new Vec3(1, 4, 7);
    //     t.equal(vec1.rotateZ(Math.PI), vec1, 'vector.rotateZ should be chainable');
    //     t.deepEqual(deepRound(vec1.toArray()), [-1, -4, 7]);

    //     var vec2 = new Vec3(1, 4, 7);
    //     t.equal(vec2.rotateZ(Math.PI*0.5), vec2, 'vector.rotateZ should be chainable');
    //     t.deepEqual(deepRound(vec2.toArray()), [-4, 1, 7]);

    //     t.end();
    // });

    t.test('scale method', function(t) {
        var vector = new Vec3();
        t.equal(typeof vector.scale, 'function', 'vector.scale should be a function');

        t.deepEqual((new Vec3(0, 1, 0)).scale(4).toArray(), [0, 4, 0], 'vector.scale should correctly scale vectors');
        t.deepEqual((new Vec3(1, 2, 3)).scale(2).toArray(), [2, 4, 6], 'vector.scale should correctly scale vectors');
        t.deepEqual((new Vec3(1, 1, 1)).scale(9).toArray(), [9, 9, 9], 'vector.scale should correctly scale vectors');
        t.deepEqual((new Vec3(3, 1, 2)).scale(7).toArray(), [21, 7, 14], 'vector.scale should correctly scale vectors');

        var vec = new Vec3(0.3, 1, 0);
        t.deepEqual(vec.scale(5.2), vec, 'vector.scale should be chainable');
        t.deepEqual(vec.toArray(), [1.56, 5.2, 0], 'vector.scale should correctly scale vectors');

        t.end();
    });

    t.test('invert method', function(t) {
        var vector = new Vec3();
        t.equal(typeof vector.invert, 'function', 'vector.invert should be a function');

        t.deepEqual((new Vec3(0, 5, 0)).invert(4).toArray(), [-0, -5, -0], 'vector.invert should correctly invert vectors');
        t.deepEqual((new Vec3(3, 7, 3)).invert(2).toArray(), [-3, -7, -3], 'vector.invert should correctly invert vectors');
        t.deepEqual((new Vec3(2, 9, 1)).invert(8).toArray(), [-2, -9, -1], 'vector.invert should correctly invert vectors');
        t.deepEqual((new Vec3(1, 3, 0)).invert(7).toArray(), [-1, -3, -0], 'vector.invert should correctly invert vectors');

        var vec = new Vec3(0.3, 1, 0);
        t.deepEqual(vec.invert(), vec, 'vector.invert should be chainable');
        t.deepEqual(vec.toArray(), [-0.3, -1, 0], 'vector.invert should correctlyinvert vectors');

        t.end();
    });

    t.test('map method', function(t) {
        var vector = new Vec3();

        t.equal(typeof vector.map, 'function', 'vector.map should be a function');

        var inverse = function(value) {
            return -value;
        };

        var vec = new Vec3(1, 2, 3);
        t.equal(vec.map(inverse), vec, 'vector.map should be chainable');
        t.deepEqual(vec.toArray(), [-1, -2, -3], 'vector.map should map values');

        t.end();
    });

    t.test('length method', function(t) {
        var vector = new Vec3();

        t.equal(typeof vector.length, 'function', 'vector.length should be a function');

        t.equal((new Vec3(1, 1, 0)).length(), Math.sqrt(2));
        t.equal((new Vec3(0, 0, 3)).length(), 3);
        t.equal((new Vec3(2, 0, 0)).length(), 2);
        t.equal((new Vec3(4, 5, 6)).length(), Math.sqrt(77));

        var vec = new Vec3(1, 2, 3);
        vec.length();
        t.deepEqual(vec.toArray(), [1, 2, 3], 'vector.length should not have any side effects');

        t.end();
    });

    t.test('copy method', function(t) {
        var vector = new Vec3();
        t.equal(typeof vector.copy, 'function', 'vector.copy should be a function');

        var vec = new Vec3(3, 4, 5);
        var sourceVec = new Vec3(6, 7, 8);
        t.equal(vec.copy(sourceVec), vec, 'vector.copy should be chainable');
        t.deepEqual(vec.toArray(), [6, 7, 8], 'vector.copy should correctly set state');
        t.deepEqual(sourceVec.toArray(), [6, 7, 8], 'vector.copy should not modify source');

        t.end();
    });

    t.test('clear method', function(t) {
        var vector = new Vec3();
        t.equal(typeof vector.clear, 'function', 'vector.clear should be a function');

        var vec = new Vec3(3, 4, 5);
        t.equal(vec.clear(), vec, 'vector.clear should be chainable');
        t.deepEqual(vec.toArray(), [0, 0, 0], 'vector.clear should clear vector');

        t.end();
    });

    t.test('isZero method', function(t) {
        var vector = new Vec3();
        t.equal(typeof vector.isZero, 'function', 'vector.isZero should be a function');

        var vec1 = new Vec3(1, 2, 3);
        t.equal(vec1.isZero(), false, 'vector.isZero should check if vector is zero');
        t.deepEqual(vec1.toArray(), [1, 2, 3], 'vector.isZero should not have any side-effects');

        t.equal(new Vec3(0, 0, 0).isZero(), true);
        t.equal(new Vec3(1, 2, 3).isZero(), false);
        t.equal(new Vec3(1, 3, 0).isZero(), false);
        t.equal(new Vec3(1, 0, 0).isZero(), false);
        t.equal(new Vec3(0, 1, 0).isZero(), false);
        t.equal(new Vec3(0, 0, 1).isZero(), false);

        t.end();
    });

    t.test('toArray method', function(t) {
        var vector = new Vec3();
        t.equal(typeof vector.toArray, 'function', 'vector');

        var vec = new Vec3(1, 2, 3);
        t.deepEqual(vec.toArray(), [1, 2, 3]);
        t.end();
    });

    t.test('normalize method', function(t) {
        var vector = new Vec3();
        t.equal(typeof vector.normalize, 'function', 'vector.normalize should be a function');

        t.deepEquals((new Vec3(2, 0, 0)).normalize().toArray(), [1, 0, 0]);
        t.deepEquals((new Vec3(2.4, 9, 5)).normalize().length(), 1, 'vector.normalize should return vector with length 1 by default');
        t.end();
    });

    t.test('applyRotation method', function(t) {
        var vector = new Vec3();
        t.equal(typeof vector.applyRotation, 'function', 'vector.applyRotation should be a function');

        var vec1 = new Vec3(4, 5, 6);
        var q = {w: 1, x: 2, y: 3, z: 4};

        vec1.applyRotation(q);

        t.deepEqual(vec1.toArray(), [72, 150, 204]);

        // TODO
        t.end();
    });

    t.test('applyMatrix method', function(t) {
        // TODO

        t.end();
    });

    t.test('clone method', function(t) {
        t.equal(typeof Vec3.clone, 'function', 'Vec3.clone should be a function');

        var sourceVec = new Vec3(1, 2, 3);
        var targetVec = Vec3.clone(sourceVec);

        t.deepEqual(sourceVec.toArray(), [1, 2, 3]);
        t.deepEqual(targetVec.toArray(), sourceVec.toArray());
        t.notEqual(targetVec.toArray(), sourceVec.toArray());
        t.notEqual(targetVec, sourceVec);

        t.end();
    });

    t.test('add method', function(t) {
        t.equal(typeof Vec3.add, 'function', 'Vec3.add should be a function');

        var summandVec1 = new Vec3(1, 2, 3);
        var summandVec2 = new Vec3(4, 5, 6);
        var resultVec = new Vec3();

        resultVec = Vec3.add(summandVec1, summandVec2, resultVec);

        t.deepEqual(summandVec1.toArray(), [1, 2, 3]);
        t.deepEqual(summandVec2.toArray(), [4, 5, 6]);
        t.deepEqual(resultVec.toArray(), [5, 7, 9]);

        t.end();
    });

    t.test('subtract method', function(t) {
        t.equal(typeof Vec3.subtract, 'function', 'Vec3.subtract should be a function');

        var vec1 = new Vec3(1, 2, 3);
        var vec2 = new Vec3(4, 5, 6);
        var resultVec = new Vec3();

        resultVec = Vec3.subtract(vec1, vec2, resultVec);
        t.deepEqual(vec1.toArray(), [1, 2, 3]);
        t.deepEqual(vec2.toArray(), [4, 5, 6]);
        t.deepEqual(resultVec.toArray(), [-3, -3, -3]);

        t.end();
    });

    t.test('scale method', function(t) {
        t.equal(typeof Vec3.scale, 'function', 'Vec3.scale should be a function');

        var vec = new Vec3(1, 2, 3);
        var resultVec = new Vec3();

        resultVec = Vec3.scale(vec, 4, resultVec);
        t.deepEqual(resultVec.toArray(), [4, 8, 12]);
        t.notEqual(resultVec, vec);
        t.deepEqual(vec.toArray(), [1, 2, 3]);

        t.end();
    });

    t.test('dot method', function(t) {
        t.equal(typeof Vec3.dot, 'function', 'Vec3.dot should be a function');

        var vec1 = new Vec3(1, 2, 3);
        var vec2 = new Vec3(4, 5, 6);
        var result;

        result = Vec3.dot(vec1, vec2);
        t.notEqual(vec1, result);
        t.notEqual(vec2, result);
        t.equal(result, 32);

        t.end();
    });

    t.test('cross method', function(t) {
        t.equal(typeof Vec3.cross, 'function', 'Vec3.cross should be a function');

        var vec1 = new Vec3(1, 2, 3);
        var vec2 = new Vec3(4, 5, 6);
        var resultVec = new Vec3();

        resultVec = Vec3.cross(vec1, vec2, resultVec);
        t.deepEqual(resultVec.toArray(), [-3, 6, -3]);
        t.notEqual(vec1, resultVec);
        t.notEqual(vec2, resultVec);

        t.end();
    });

    t.test('project method', function(t) {
        t.equal(typeof Vec3.project, 'function', 'Vec3.project should be a function');

        var vec1 = new Vec3(1, 2, 3);
        var vec2 = new Vec3(-1, -2, -3);
        var resultVec = new Vec3();

        resultVec = Vec3.project(vec1, vec2, resultVec);
        t.deepEqual(resultVec.toArray(), [1, 2, 3]);
        t.notEqual(vec1, resultVec);
        t.notEqual(vec2, resultVec);

        t.deepEqual(Vec3.project(new Vec3(1, 2, 3), new Vec3(0, -2, -3), new Vec3()).toArray(), [0, 2, 3]);
        t.deepEqual(Vec3.project(new Vec3(1, 1, 1), new Vec3(0, -2, -4), new Vec3()).toArray(), [0, 0.6, 1.2]);

        t.end();
    });
});
