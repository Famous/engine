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
var Quaternion = require('../Quaternion');
var Vec3 = require('../Vec3');

test('Quaternion', function(t) {
    t.test('constructor', function(t) {
        t.plan(4);
        t.equal(typeof Quaternion, 'function', 'Quaternion should be a function');

        t.doesNotThrow(function() {
            new Quaternion();
        });

        t.deepEqual(new Quaternion(), { w: 1, x: 0, y: 0, z: 0 });
        t.deepEqual(new Quaternion(Math.PI*0.5, 4, 5, 6), { w: Math.PI*0.5, x: 4, y: 5, z: 6 });
    });

    t.test('add method', function(t) {
        t.plan(5);
        var quaternion = new Quaternion(Math.PI*0.5, 1, 2, 3);
        t.equal(typeof quaternion.add, 'function', 'quaternion.add should be a function');

        var summand = new Quaternion(Math.PI, 1, 2, 3);

        var sum = quaternion.add(summand);
        t.equal(sum.w, Math.PI*1.5);
        t.equal(sum.x, 2);
        t.equal(sum.y, 4);
        t.equal(sum.z, 6);
    });

    t.test('subtract method', function(t) {
        t.plan(5);
        var quaternion = new Quaternion(Math.PI*0.2, 4, 5, 6);
        t.equal(typeof quaternion.subtract, 'function', 'quaternion.subtract should be a function');

        var subtrahend = new Quaternion(Math.PI, 1, 2, 3);

        var result = quaternion.subtract(subtrahend);
        t.equal(result.w, -Math.PI*0.8);
        t.equal(result.x, 3);
        t.equal(result.y, 3);
        t.equal(result.z, 3);
   });

    t.test('scale method', function(t) {
        t.plan(5);
        var quaternion = new Quaternion(Math.PI*0.2, 4, 5, 6);
        t.equal(typeof quaternion.scale, 'function', 'quaternion.scale should be a function');

        var result = quaternion.scale(0.5);
        t.equal(result.w, Math.PI*0.1);
        t.equal(result.x, 2);
        t.equal(result.y, 2.5);
        t.equal(result.z, 3);
    });

    t.test('multiply method', function(t) {
        t.plan(5);
        var quaternion = new Quaternion(1, 0.5, 0.5, 0.75);
        t.equal(typeof quaternion.multiply, 'function', 'quaternion.multiply should be a function');

        var result = quaternion.multiply(new Quaternion(1, 0, 1, 0));
        t.equal(result.w, 0.5);
        t.equal(result.x, 1.25);
        t.equal(result.y, 1.5);
        t.equal(result.z, 0.25);
    });

    t.test('leftMultiply method', function(t) {
        t.plan(5);
        var quaternion = new Quaternion(1, 0, 1, 0);
        t.equal(typeof quaternion.leftMultiply, 'function', 'quaternion.leftMultiply should be a function');

        var result = quaternion.leftMultiply(new Quaternion(1, 0.5, 0.5, 0.75));
        t.equal(result.w, 0.5);
        t.equal(result.x, 1.25);
        t.equal(result.y, 1.5);
        t.equal(result.z, 0.25);
    });

    t.test('rotateVector method', function(t) {
        t.plan(3);
        var quaternion = new Quaternion(1, 0, 1, 0);
        t.equal(typeof quaternion.rotateVector, 'function', 'quaternion.rotateVector should be a function');

        var outputVec3 = {x: 1, y: 2, z: 0.5};
        var v = {x: 1, y: 1, z: 1};
        t.equal(quaternion.rotateVector(v, outputVec3), outputVec3, 'quaternion.rotateVector should be chainable');

        t.deepEqual(outputVec3, { x: 2, y: 2, z: -2 });
    });
    
    t.test('invert method', function(t) {
        t.plan(3);
        var quaternion = new Quaternion(1.5, 9.2, 2.3, -2.5);
        t.equal(typeof quaternion.invert, 'function', 'quaternion.invert should be a function');
        t.equal(quaternion.invert(), quaternion, 'quaternion.invert should be chainable');
        t.deepEqual(quaternion, { w: -1.5, x: -9.2, y: -2.3, z: 2.5 });
    });
    
    t.test('conjugate method', function(t) {
        t.plan(3);
        var quaternion = new Quaternion(1.5, 9.2, 2.3, -2.5);
        t.equal(typeof quaternion.conjugate, 'function', 'quaternion.conjugate should be a function');
        t.equal(quaternion.conjugate(), quaternion, 'quaternion.conjugate should be chainable');
        t.deepEqual(quaternion, { w: 1.5, x: -9.2, y: -2.3, z: 2.5 });
    });
    
    t.test('length method', function(t) {
        t.plan(2);
        var quaternion = new Quaternion(1, 5, 0, 0);
        t.equal(typeof quaternion.length, 'function', 'quaternion.length should be a function');
        t.equal(quaternion.length(), Math.sqrt(26));
    });
    
    t.test('normalize method', function(t) {
        t.plan(3);
        var quaternion = new Quaternion(1, 2, 2, 2);
        t.equal(typeof quaternion.normalize, 'function', 'quaternion.normalize should be a function');

        var normalizedQuaternion = quaternion.normalize();
        t.equal(normalizedQuaternion, quaternion);
        t.deepEqual(normalizedQuaternion.length(), 1);
    });

    t.test('makeFromAngleAndAxis method', function(t) {
        t.plan(3);
        var vector, angle;
        var quaternion = new Quaternion();
        t.equal(typeof quaternion.makeFromAngleAndAxis, 'function', 'quaternion.makeFromAngleAndAxis should be a function');

        vector = new Vec3(1, 2, 3);
        angle = 0;
        t.deepEqual(quaternion.makeFromAngleAndAxis(angle, vector), {w: 1, x: 0, y: 0, z: 0});

        vector = new Vec3(2, 0, 0);
        angle = Math.PI*2;
        t.deepEqual(quaternion.makeFromAngleAndAxis(angle, vector), {w: -1, x: -Math.sin(Math.PI), y: 0, z: 0});
    });

    t.test('set method', function(t) {
        t.plan(3);
        var quaternion = new Quaternion(Math.PI*0.5, 8, 1, 3);
        t.equal(typeof quaternion.set, 'function', 'quaternion.set should be a function');

        quaternion.set(0, 1, 2, 3);
        t.deepEqual(quaternion, {w: 0, x: 1, y: 2, z: 3});

        quaternion.set(0, 1, 2, 4);
        t.deepEqual(quaternion, {w: 0, x: 1, y: 2, z: 4});
    });

    t.test('copy method', function(t) {
        t.plan(3);
        var quaternion = new Quaternion(1, 2, 4, 5);
        t.equal(typeof quaternion.copy, 'function', 'quaternion.copy should be a function');
        var targetQuaternion = new Quaternion(4, 5, 6, 9);
        targetQuaternion.copy(quaternion);
        t.deepEqual(quaternion, targetQuaternion);
        t.deepEqual(quaternion, {w: 1, x: 2, y: 4, z: 5});
    });

    t.test('clear method', function(t) {
       t.plan(2);
       var quaternion = new Quaternion(Math.PI*0.5, 8, 1, 3);
       t.equal(typeof quaternion.clear, 'function', 'quaternion.clear should be a function');

       quaternion.clear();
       t.deepEqual(quaternion, {w: 1, x: 0, y: 0, z: 0});
    });

    t.test('dot method', function(t) {
       t.plan(2);
       var quaternion = new Quaternion();
       t.equal(typeof quaternion.dot, 'function', 'quaternion.dot should be a function');

       var q1 = new Quaternion(Math.PI*0.5, 8, 1, 3);
       var q2 = new Quaternion(3,           4, 2, 6);

       t.deepEqual(q1.dot(q2), Math.PI*1.5 + 32 + 2 + 18);
    });

    t.test('getMatrix method', function(t) {
       t.plan(1);
       var quaternion = new Quaternion();
       t.equal(typeof quaternion.getMatrix, 'function', 'quaternion.getMatrix should be a function');
    });

    t.test('slerp method', function(t) {
        t.plan(1);
        var quaternion = new Quaternion();
        t.equal(typeof quaternion.slerp, 'function', 'quaternion.slerp should be a function');
        // TODO
    });

    t.test('toEulerXYZ method', function(t) {
        t.plan(1);
        var quaternion = new Quaternion();
        t.equal(typeof quaternion.toEulerXYZ, 'function', 'quaternion.toEulerXYZ should be a function');
        // TODO
    });

    t.test('fromEulerXYZ method', function(t) {
        t.plan(1);
        t.equal(typeof Quaternion.fromEulerXYZ, 'function', 'quaternion.fromEulerXYZ should be a function');
        // TODO
    });
    
    t.test('multiply method', function(t) {
        t.plan(1);
        t.equal(typeof Quaternion.multiply, 'function', 'quaternion.multiply should be a function');
        // TODO
    });
    
    t.test('conjugate method', function(t) {
        t.plan(1);
        t.equal(typeof Quaternion.conjugate, 'function', 'quaternion.conjugate should be a function');
        // TODO
    });
    
    t.test('normalize method', function(t) {
        t.plan(1);
        t.equal(typeof Quaternion.normalize, 'function', 'quaternion.normalize should be a function');
        // TODO
    });
    
    t.test('clone method', function(t) {
        t.plan(1);
        t.equal(typeof Quaternion.clone, 'function', 'quaternion.clone should be a function');
        // TODO
    });
    
    t.test('add method', function(t) {
        t.plan(1);
        t.equal(typeof Quaternion.add, 'function', 'quaternion.add should be a function');
        // TODO
    });
    
    t.test('subtract method', function(t) {
        t.plan(1);
        t.equal(typeof Quaternion.subtract, 'function', 'quaternion.subtract should be a function');
        // TODO
    });
    
    t.test('scale method', function(t) {
        t.plan(1);
        t.equal(typeof Quaternion.scale, 'function', 'quaternion.scale should be a function');
        // TODO
    });
    
    t.test('dot method', function(t) {
        t.plan(1);
        t.equal(typeof Quaternion.dot, 'function', 'quaternion.dot should be a function');
        // TODO
    });
});