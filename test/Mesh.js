'use strict';

var test = require('tape');
var Mesh = require('../src/Mesh');
var MockDispatch = require('./MockDispatch');
var MockColor = require('./MockColor');

var time = 0;
var _now = Date.now;
var node, mesh, dispatch, geometry;

/**
 * Helper function for creating a mesh using a dummy dispatch
 */
function createMesh(options) {
    var dispatch = new MockDispatch();
    return {
        mesh: new Mesh(dispatch, options),
        dispatch: dispatch
    };
}

/**
 * Dummy material expression
 */
var materialExpression = {
    _compile: function() { return 'sampleExpression'; }
};

/**
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

        Date.now = function() { return time; };
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
        t.true(contains(['GL_SET_DRAW_OPTIONS', 'randomOption'], mesh.queue),
            'should take options');

        t.end();
    });

    t.test('Mesh.toString', function(t) {

        t.equal(typeof Mesh.toString, 'function',
            'should be a function');

        t.equal(Mesh.toString(), 'Mesh');

        t.end();
    });

    t.test('Mesh.prototype.setOptions', function(t) {
        mesh = createMesh().mesh;

        t.equal(typeof mesh.setOptions, 'function',
            'should be a function');

        t.false(~mesh.queue.indexOf('notPassedIn'),
            'should not contain false options');

        mesh.setOptions('randomOption');
        t.true(contains(['GL_SET_DRAW_OPTIONS', 'randomOption'], mesh.queue),
            'should take options');

        t.false(contains(['GL_SET_DRAW_OPTIONS', 'notIncluded'], mesh.queue),
            'should not pass fake options');

        t.end();
    });

    t.test('Mesh.prototype._receiveTransformChange', function(t) {

        node = createMesh();
        mesh = node.mesh;
        dispatch = node.dispatch;
        t.equal(typeof mesh._receiveTransformChange, 'function',
            'should be a function');

        t.doesNotThrow(function() {
            mesh._receiveTransformChange(dispatch.getContext()._transform);
        }, 'should not throw an error given an appropriate input');

        t.throws(function() {
            mesh._receiveTransformChange();
        }, 'should throw an error without a dispatch');

        t.end();
    });

    t.test('Mesh.prototype._receiveSizeChange', function(t) {

        node = createMesh();
        mesh = node.mesh;
        dispatch = node.dispatch;
        t.equal(typeof mesh._receiveSizeChange, 'function',
            'should be a function');

        t.doesNotThrow(function() {
            mesh._receiveSizeChange(dispatch.getContext()._size);
        }, 'should not throw an error given the appropriate input');

        t.throws(function() {
            mesh._receiveSizeChange();
        }, 'should throw an error without a dispatch');

        t.end();
    });

    t.test('Mesh.prototype._receiveOpacityChange', function(t) {

        node = createMesh();
        mesh = node.mesh;
        dispatch = node.dispatch;
        t.equal(typeof mesh._receiveOpacityChange, 'function',
            'should be a function');

        t.doesNotThrow(function() {
            mesh._receiveOpacityChange(dispatch.getContext()._opacity);
        }, 'should not throw an error given the appropriate input');

        t.throws(function() {
            mesh._receiveOpacityChange();
        }, 'should throw an error without a dispatch');

        t.end();
    });

    t.test('Mesh.prototype.getSize', function(t) {

        mesh = createMesh().mesh;
        t.equal(typeof mesh.getSize, 'function',
            'should be a function');

        t.deepEqual(mesh.getSize(), [100, 100, 100],
            'should return size of renderable');

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
            mesh.setGeometry('Sphere');
        }, 'accepts string references for geometries');

        var geometry = mesh._geometry;
        t.true(contains(['GL_SET_GEOMETRY', geometry.id, geometry.spec.type, geometry.spec.dynamic], mesh.queue),
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

    t.test('Mesh.prototype._pushActiveCommands', function(t) {

        mesh = createMesh().mesh;
        t.equal(typeof mesh._pushActiveCommands, 'function',
            'should be a function');

        t.end();
    });

    t.test('Mesh.prototype.clean', function(t) {

        mesh = createMesh().mesh;
        t.equal(typeof mesh.clean, 'function',
            'should be a function');

        t.true(mesh.queue,
            'should have a populated queue');

        mesh.clean();
        t.equal(mesh.queue.length, 0,
            'should have an empty (cleaned) queue');

        t.end();
    });

    t.test('Mesh.prototype.setBaseColor', function(t) {

        mesh = createMesh().mesh;
        t.equal(typeof mesh.setBaseColor, 'function',
            'should be a function');

        t.false(mesh._expressions.baseColor,
            'should not have a material expression by default');

        mesh.setBaseColor(materialExpression);
        t.true(contains(['sampleExpression'], mesh.queue),
            'should be able to take a material expression');

        t.false(mesh._color,
            'should not have a color by default');

        mesh.setBaseColor(new MockColor());
        t.true(contains(['1,1,1'], mesh.queue),
            'should be able to take a Color instance');

        t.end();
    });

    t.test('Mesh.prototype.getBaseColor', function(t) {

        mesh = createMesh().mesh;
        t.equal(typeof mesh.getBaseColor, 'function',
            'should be a function');

        mesh.setBaseColor(materialExpression);
        t.true(mesh.getBaseColor()._compile,
            'should be able to take a material expression');

        mesh.setBaseColor(new MockColor());
        t.true(mesh.getBaseColor().getColor,
            'should be able to return the color instance');

        t.end();
    });

    t.test('Mesh.prototype.setFlatShading', function(t) {

        mesh = createMesh().mesh;
        t.equal(typeof mesh.setFlatShading, 'function',
            'should be a function');

        t.false(mesh._flatShading,
            'should be false by default');

        mesh.setFlatShading(true);
        t.true(mesh._flatShading,
            'should be true when set to true');

        mesh.setFlatShading(false);
        t.false(mesh._flatShading,
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
        t.equal(typeof mesh.setNormals, 'function',
            'should be a function');


        mesh.setNormals(materialExpression);
        t.true(contains(['MATERIAL_INPUT', 'normal', 'sampleExpression'], mesh.queue),
            'should be able to take a normal material expression');

        t.end();
    });

    t.test('Mesh.prototype.getNormals', function(t) {

        mesh = createMesh().mesh;
        t.equal(typeof mesh.getNormals, 'function',
            'should be a function');

        mesh.setNormals(materialExpression);
        t.true(mesh.getNormals()._compile,
            'should be able to return the Normals expression');

        t.end();
    });

    t.test('Mesh.prototype.setGlossiness', function(t) {
        time = 0;

        mesh = createMesh().mesh;
        t.equal(typeof mesh.setGlossiness, 'function',
            'should be a function');

        mesh.setGlossiness(materialExpression);
        t.true(contains(['MATERIAL_INPUT', 'glossiness', 'sampleExpression'], mesh.queue),
            'should take a material expression for glossiness');

        mesh.setGlossiness(10, { duration: 1000 }, function() {
            t.pass('should accept and invoke a callback function')
        });

        t.equal(typeof mesh._glossiness, 'object',
            'should take an integer for setting glossiness');

        time = 1000;
        t.equal(mesh.getGlossiness(), 10,
            'should accept and tween a transition argument');

        t.end();
    });

    t.test('Mesh.prototype.getGlossiness', function(t) {

        mesh = createMesh().mesh;
        t.equal(typeof mesh.getGlossiness, 'function',
            'should be a function');

        mesh.setGlossiness(materialExpression);
        t.true(mesh.getGlossiness()._compile,
            'should be able to return the glossiness expression');

        mesh.setGlossiness(10);
        t.equal(mesh.getGlossiness(), 10,
            'should be able to return the glossiness value');

        t.end();
    });

    t.test('Mesh.prototype.setPositionOffset', function(t) {
        time = 0;

        mesh = createMesh().mesh;
        t.equal(typeof mesh.setPositionOffset, 'function',
            'should be a function');

        mesh.setPositionOffset(materialExpression);
        t.true(contains(['MATERIAL_INPUT', 'positionOffset', 'sampleExpression'], mesh.queue),
            'should take a material expression for positionOffset');

        mesh.setPositionOffset(10, { duration: 1000 }, function() {
            t.pass('should accept and invoke a callback function')
        });

        t.equal(typeof mesh._positionOffset, 'object',
            'should take an integer for setting positionOffset');

        time = 1000;
        t.equal(mesh.getPositionOffset(), 10,
            'should accept and tween a transition argument');

        t.end();
    });

    t.test('Mesh.prototype.getPositionOffset', function(t) {
        time = 0;

        mesh = createMesh().mesh;
        t.equal(typeof mesh.getPositionOffset, 'function',
            'should be a function');

        mesh.setPositionOffset(materialExpression);
        t.true(mesh.getPositionOffset()._compile,
            'should be able to return the glossiness expression');

        mesh.setPositionOffset([10, 10, 10]);
        t.deepEqual(mesh.getPositionOffset(), [10, 10, 10],
            'should be able to return the glossiness value');

        t.end();
    });

});
