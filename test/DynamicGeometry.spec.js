'use strict';
var test = require('tape');
var DynamicGeometry = require('../src/DynamicGeometry');
var Circle = require('../src/primitives/Circle');

test('DynamicGeometry', function(t) {
    t.test('constructor', function(t) {
        var geometry = new DynamicGeometry();

        t.ok(geometry.spec instanceof Object, 'should have a spec object');
        t.equal(geometry.spec.bufferNames.length, 0, 'should not have any vertex buffers by default');
        t.ok(geometry.spec.type === 4, 'should have correct default draw style.');

        var indexValue = [[1, 2, 3]];
        var secondGeometry = new DynamicGeometry({
            buffers: [{ name: 'indices', data: indexValue, size: 1 }]
        });

        t.notEqual(geometry.id, secondGeometry.id, 'should have unique ID');
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
                name: 'pos', data: posAttribArray
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

    t.end();
});
