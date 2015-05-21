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
var Mesh = require('../Mesh');
var MockDispatch = require('./MockDispatch');
var MockColor = require('./MockColor');

var time = 0;
var node;
var mesh;

/*
 * Helper function for creating a mesh using a dummy dispatch
 */
function createMesh(options) {
    var dispatch = new MockDispatch();
    return {
        mesh: new Mesh(dispatch, options),
        dispatch: dispatch
    };
}

/*
 * Dummy material expression
 */
var materialExpression = {
    __isAMaterial__: true
};

/*
 * Helper function for checking whether N number of strings (checkList)
 * are contained in an array list (containerList)
 */
function contains(checkList, containerList) {
    for(var i = 0, len = checkList.length; i < len; i++) {
        if (!~containerList.indexOf(checkList[i])) return false;
    }
    return true;
}

test('Mesh', function(t) {

    t.test('Time setup', function(t) {
        time = 0;

        Date.now = function() {
            return time;
        };
        t.equal(typeof Date.now, 'function',
            'should be a function');

        time = 50;
        t.equal(Date.now(), 50,
            'should manipulate current time for testing');

        time = 0;
        t.equal(Date.now(), 0,
            'should be able to set time to 0');

        t.end();
    });

    t.test('createMesh helper', function(t) {

        t.doesNotThrow(createMesh,
            'should not throw an error');

        t.end();
    });

    t.test('contains helper', function(t) {

        var checkList = ['one', 'two'];
        var notIncluded = ['notIncluded'];
        var containerList = ['one', 'two', 'three', 'four'];

        t.true(contains(checkList, containerList),
            'should pass for all string lists that are included');

        t.false(contains(notIncluded, containerList),
            'should fail for string lists that are not included');

        t.end();
    });

    t.test('Mesh constructor', function(t) {

        t.equal(typeof Mesh, 'function',
            'should be a function');

        t.throws(function() {
            mesh = new Mesh();
        }, 'should throw an error if a node is not provided');

        mesh = createMesh().mesh;
        t.equal(typeof mesh.setBaseColor, 'function',
            'mesh should be instantiated without errors');

        mesh = createMesh('randomOption').mesh;
        t.true(contains(['GL_SET_DRAW_OPTIONS', 'randomOption'], mesh._changeQueue),
            'should take options');

        t.end();
    });

    t.test('Mesh.prototype.setDrawOptions', function(t) {
        mesh = createMesh().mesh;

        t.equal(typeof mesh.setDrawOptions, 'function',
            'should be a function');

        t.false(~mesh._changeQueue.indexOf('notPassedIn'),
            'should not contain false options');

        mesh.setDrawOptions('randomOption');
        t.true(contains(['GL_SET_DRAW_OPTIONS', 'randomOption'], mesh._changeQueue),
            'should take options');

        t.false(contains(['GL_SET_DRAW_OPTIONS', 'notIncluded'], mesh._changeQueue),
            'should not pass fake options');

        t.end();
    });

    t.test('Mesh.prototype.onTransformChange', function(t) {

        node = createMesh();
        mesh = node.mesh;
        t.equal(typeof mesh.onTransformChange, 'function',
            'should be a function');

        var transform = new Array(16);

        mesh.onSizeChange(transform);

        t.ok(contains(mesh._changeQueue, ['GL_UNIFORMS', 'u_transform', transform]),
             'should enqueue transform changes');
        t.end();
    });

    t.test('Mesh.prototype.onSizeChange', function(t) {

        node = createMesh();
        mesh = node.mesh;
        t.equal(typeof mesh.onSizeChange, 'function',
            'should be a function');

        mesh.onSizeChange('none');

        t.ok(contains(mesh._changeQueue, ['GL_UNIFORMS', 'u_size', 'none']),
             'should enqueue size changes');

        t.end();
    });

    t.test('Mesh.prototype.onOpacityChange', function(t) {

        node = createMesh();
        mesh = node.mesh;
        t.equal(typeof mesh.onOpacityChange, 'function',
            'should be a function');

        mesh.onOpacityChange(5);

        t.ok(contains(mesh._changeQueue, ['GL_UNIFORMS', 'u_opacity', 5]),
             'should enqueue opacity changes');

        t.end();
    });

    t.test('Mesh.prototype.setGeometry', function(t) {

        mesh = createMesh().mesh;
        t.equal(typeof mesh.setGeometry, 'function',
            'should be a function');

        t.throws(function() {
            mesh.setGeometry('notAGeometry');
        }, 'throws an error for geometry string references that are not included');

        t.doesNotThrow(function() {
            mesh._initialized = true;
            mesh.setGeometry('Sphere');
        }, 'accepts string references for geometries');

        var geometry = mesh.value.geometry;

        t.true(contains(['GL_SET_GEOMETRY', geometry.spec.id, geometry.spec.type, geometry.spec.dynamic], mesh._changeQueue),
            'sends the appropriate commands for geometry');

        t.end();
    });

    t.test('Mesh.prototype.getGeometry', function(t) {

        mesh = createMesh().mesh;
        t.equal(typeof mesh.getGeometry, 'function',
            'should be a function');

        t.false(mesh.getGeometry(),
            'should not return a geometry if none has been set');

        mesh.setGeometry('Box');
        t.true(mesh.getGeometry(),
            'should return a geometry if one has been set');

        t.end();
    });

    t.test('Mesh.prototype._pushInvalidations', function(t) {

        mesh = createMesh().mesh;
        t.equal(typeof mesh._pushInvalidations, 'function',
            'should be a function');

        t.end();
    });

    t.test('Mesh.prototype.setBaseColor', function(t) {

        mesh = createMesh().mesh;
        mesh._initialized = true;

        t.equal(typeof mesh.setBaseColor, 'function',
            'should be a function');

        t.false(mesh.value.expressions.baseColor,
            'should not have a material expression by default');

        mesh.setBaseColor(materialExpression);
        t.true(contains([materialExpression], mesh._changeQueue),
            'should be able to take a material expression');

        t.false(mesh._color,
            'should not have a color by default');

        var length = mesh._changeQueue.length;
        var c = new MockColor();
        mesh.setBaseColor(c);

        t.true(length < mesh._changeQueue.length, 'should be able to take a Color instance');

        t.end();
    });

    t.test('Mesh.prototype.getBaseColor', function(t) {

        mesh = createMesh().mesh;
        t.equal(typeof mesh.getBaseColor, 'function',
            'should be a function');

        mesh.setBaseColor(materialExpression);

        t.true(mesh.getBaseColor().__isAMaterial__,
            'should be able to take a material expression');

        t.end();
    });

    t.test('Mesh.prototype.setFlatShading', function(t) {

        mesh = createMesh().mesh;
        t.equal(typeof mesh.setFlatShading, 'function',
            'should be a function');

        t.false(mesh._flatShading,
            'should be false by default');

        mesh.setFlatShading(true);
        t.true(mesh.value.flatShading,
            'should be true when set to true');

        mesh.setFlatShading(false);
        t.false(mesh.value.flatShading,
            'should be false when set to false');

        t.end();
    });

    t.test('Mesh.prototype.getFlatshading', function(t) {

        mesh = createMesh().mesh;
        t.equal(typeof mesh.getFlatShading, 'function',
            'should be a function');

        t.false(mesh._flatShading,
            'should be false by default');

        mesh.setFlatShading(true);
        t.true(mesh.getFlatShading(),
            'should return true when set to true');

        mesh.setFlatShading(false);
        t.false(mesh.getFlatShading(),
            'should return false when set to false');

        t.end();
    });

    t.test('Mesh.prototype.setNormals', function(t) {

        mesh = createMesh().mesh;
        mesh._initialized = true;
        t.equal(typeof mesh.setNormals, 'function',
            'should be a function');


        mesh.setNormals(materialExpression);

        t.true(contains(['MATERIAL_INPUT', 'u_normals', materialExpression], mesh._changeQueue),

            'should be able to take a normal material expression');

        t.end();
    });

    t.test('Mesh.prototype.getNormals', function(t) {

        mesh = createMesh().mesh;
        t.equal(typeof mesh.getNormals, 'function',
            'should be a function');

        mesh.setNormals(materialExpression);
        t.true(mesh.getNormals().__isAMaterial__,
            'should be able to return the Normals expression');

        t.end();
    });

    t.test('Mesh.prototype.setGlossiness', function(t) {
        time = 0;

        mesh = createMesh().mesh;

        mesh._initialized = true;

        t.equal(typeof mesh.setGlossiness, 'function',
            'should be a function');

        mesh.setGlossiness(materialExpression);
        t.true(contains(['MATERIAL_INPUT', 'u_glossiness', materialExpression], mesh._changeQueue),
            'should take a material expression for glossiness');

        mesh.setGlossiness(new MockColor(), 10);

        t.equal(typeof mesh.value.glossiness, 'object',
            'should take constants  for setting glossiness');

        t.end();
    });

    t.test('Mesh.prototype.getGlossiness', function(t) {

        mesh = createMesh().mesh;
        t.equal(typeof mesh.getGlossiness, 'function',
            'should be a function');

        mesh.setGlossiness(materialExpression);
        t.true(mesh.getGlossiness().__isAMaterial__,
            'should be able to return the glossiness expression');

        var x = new MockColor();
        mesh.setGlossiness(x, 10);
        t.equal(mesh.getGlossiness()[0], x,
            'should be able to return the glossiness value');

        t.end();
    });

    t.test('Mesh.prototype.setPositionOffset', function(t) {
        time = 0;

        mesh = createMesh().mesh;
        mesh._initialized = true;
        t.equal(typeof mesh.setPositionOffset, 'function',
            'should be a function');

        mesh.setPositionOffset(materialExpression);
        t.true(contains(['MATERIAL_INPUT', 'u_positionOffset', materialExpression], mesh._changeQueue),
            'should take a material expression for positionOffset');

        mesh.setPositionOffset([.5, .2, .1]);
        t.equal(typeof mesh.value.positionOffset, 'object',
            'should take a constant for setting positionOffset');

        t.end();
    });

    t.test('Mesh.prototype.getPositionOffset', function(t) {
        time = 0;

        mesh = createMesh().mesh;
        t.equal(typeof mesh.getPositionOffset, 'function',
            'should be a function');

        mesh.setPositionOffset(materialExpression);
        t.true(mesh.getPositionOffset().__isAMaterial__,
            'should be able to return the glossiness expression');

        mesh.setPositionOffset([10, 10, 10]);
        t.deepEqual(mesh.getPositionOffset(), [10, 10, 10],
            'should be able to return the glossiness value');

        t.end();
    });

});
