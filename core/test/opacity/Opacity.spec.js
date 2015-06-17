'use strict';

var test = require('tape');
var api = require('./Opacity.api');
var Opacity = require('../../Opacity');
var OpacityStub = require('./Opacity.stub');
var NodeStub = require('../node/Node.stub');
var sinon = require('sinon');

function createTestNode () {
    var node = new NodeStub();
    // node.getSize.returns([100, 100, 100]);
    // node.getParent.returns({ getSize: sinon.stub().returns([200, 200, 200]) });
    return node;
}

test('Opacity class', function (t) {

    t.test('Opacity constructor' , function (t) {

        t.ok(Opacity, 'There should be a transform module');
        t.equal(Opacity.constructor, Function, 'Opacity should be a function');

        t.doesNotThrow(function () {
            return new Opacity();
        }, 'Opacity should be callable with new');

        t.doesNotThrow(function () {
            return new Opacity(new OpacityStub());
        }, 'Opacity should be callable with new and another transform as an argument');

        t.equal((new Opacity()).constructor, Opacity, 'Opacity should be a constructor function');

        var transform = new Opacity();

        api.forEach(function (method) {
            t.ok(
                transform[method] && transform[method].constructor === Function,
                'Opacity should have a ' + method + ' method'
            );
        });

        t.equal(Opacity.WORLD_CHANGED, 1, 'Opacity should have a static property WORLD_CHANGED that equals 1');
        t.equal(Opacity.LOCAL_CHANGED, 2, 'Opacity should have a static property LOCAL_CHANGED that equals 2');

        var parent = new OpacityStub();
        transform = new Opacity(parent);

        t.equal(transform.getParent(), parent, 'Opacity constructor should have its parent set to the first argument');

        t.notOk(transform.isBreakPoint(), 'Transforms should not be a breakpoint by default');

        t.end();
    });

    t.test('no breakpoints', function (t) {

        var opacities = [];

        for (var i = 0; i < 5; i++)
            opacities.push(new Opacity(opacities[i - 1]));


        for (i = 0; i < opacities.length; i++)
            opacities[i].setOpacity(0.5);


        for (i = 0; i < opacities.length; i++)
            console.log(opacities[i])



        t.end();
    });
    //
    // t.test('getParent method', function (t) {
    //
    //     var transform = new Opacity('hello');
    //     t.doesNotThrow(function () {
    //         transform.getParent();
    //     }, 'transform should be callable');
    //
    //     t.equal(transform.getParent(), 'hello', 'getParent should return the value passed to the constructor');
    //     transform.setParent('bye');
    //     t.equal(transform.getParent(), 'bye', 'getParent should return the value passed to the setParent method');
    //
    //     t.end();
    // });
    //
    // t.test('setBreakPoint', function (t) {
    //
    //     var transform = new Opacity();
    //
    //     // sanity check
    //     if (transform.isBreakPoint())
    //         throw new Error('Opacity should not be a breakpoint by default.' +
    //             ' isBreakPoint or the constructor might be broken');
    //
    //     t.doesNotThrow( function () {
    //         transform.setBreakPoint();
    //     }, 'setBreakPoint should be callable');
    //
    //     t.ok(transform.isBreakPoint(), 'after calling setBreakpoint, a transform should be a breakpoint');
    //
    //     t.end();
    // });
    //
    // t.test('isBreakPoint', function (t) {
    //
    //     var transform = new Opacity();
    //
    //     t.doesNotThrow(function () {
    //         t.notOk(transform.isBreakPoint(), 'transforms are not a breakpoint when they are first instantiated');
    //     }, 'isBreakPoint should be callable if the transform is not a breakpoint');
    //
    //     transform.setBreakPoint();
    //
    //     t.doesNotThrow(function () {
    //         t.ok(transform.isBreakPoint(), 'isBreakPoint should return true when the transform is a breakpoint');
    //     }, 'isBreakPoint should be callable if the transform is a breakpoint');
    //
    //     transform.reset();
    //
    //     t.end();
    // });
    //
    // t.test('reset method', function (t) {
    //     var parent = new OpacityStub();
    //     var transform = new Opacity(parent);
    //     transform.setBreakPoint();
    //
    //     // sanity check
    //     if (parent !== transform.getParent() || !transform.isBreakPoint())
    //         throw new Error('transform.getParent or isBreakPoint is not functioning correctly');
    //
    //     t.doesNotThrow(transform.reset.bind(transform), 'reset should be callable without arguments');
    //
    //     api.forEach(function (method) {
    //         t.notOk(parent[method].called, 'No calls should be made on the parent during reset');
    //     });
    //
    //     var a = 2;
    //     while (a--) {
    //         t.ok(transform.getParent() == null, 'after being reset, transform should not have a parent');
    //         t.notOk(transform.isBreakPoint(), 'after being reset, transform should not be a breakpoint');
    //         transform = new Opacity();
    //         transform.reset();
    //     }
    //
    //     t.end();
    // });
    //
    // t.test('getLocalTransform method', function (t) {
    //     var transform = new Opacity();
    //     t.doesNotThrow(function () {
    //         t.deepEqual(transform.getLocalTransform(), new Float32Array([
    //                                                     1, 0, 0, 0,
    //                                                     0, 1, 0, 0,
    //                                                     0, 0, 1, 0,
    //                                                     0, 0, 0, 1]), 'transform.getLocalTransform should return' +
    //                                                                  ' identity matrix after instantiation');
    //     }, 'getLocalTransform should be callable');
    //
    //     t.end();
    // });
    //
    // t.test('getWorldTransform method', function (t) {
    //     var transform = new Opacity();
    //
    //     // sanity check
    //     if (transform.isBreakPoint()) throw new Error('transform is reporting itself to be ' +
    //                                                   'a breakpoint after instantiation. isBreakPoint ' +
    //                                                   'or the constructor might be broken');
    //
    //     t.throws(transform.getWorldTransform.bind(transform), 'getWorldTransform should throw if ' +
    //                                                           'the transform isn\'t a breakpoint');
    //
    //     transform.setBreakPoint();
    //
    //     t.doesNotThrow(function () {
    //         t.deepEqual(transform.getWorldTransform(), new Float32Array([
    //                                                     1, 0, 0, 0,
    //                                                     0, 1, 0, 0,
    //                                                     0, 0, 1, 0,
    //                                                     0, 0, 0, 1]), 'transform.getWorldTransform should return' +
    //                                                                  ' identity matrix after instantiation');
    //     }, 'getWorldTransform should not throw if the transform is a breakpoint');
    //
    //     t.end();
    // });
    //
    // t.test('calculate method', function (t) {
    //     var transform = new Opacity();
    //
    //     t.doesNotThrow(function () {
    //         transform.calculate(createTestNode());
    //         t.deepEqual(transform.getLocalTransform(), new Float32Array([
    //                                                     1, 0, 0, 0,
    //                                                     0, 1, 0, 0,
    //                                                     0, 0, 1, 0,
    //                                                     0, 0, 0, 1]), 'transform.getLocalTransform should return' +
    //                                                                  ' identity matrix with no vectors changed');
    //     }, '.calculate should be callable');
    //
    //     t.end();
    // });
    //
    // t.test('setPosition method', function (t) {
    //     var transform = new Opacity();
    //
    //     t.doesNotThrow( function () {
    //         transform.setPosition(0);
    //         t.deepEqual(transform.getPosition(), new Float32Array([0, 0, 0]), 'transform should not change from zero when a dimension is passed ' +
    //                                                         'null, undefined, or zero');
    //         transform.setPosition(0, 0);
    //         t.deepEqual(transform.getPosition(), new Float32Array([0, 0, 0]), 'transform should not change from zero when a dimension is passed ' +
    //                                                         'null, undefined, or zero');
    //         transform.setPosition(0, 0, 0);
    //         t.deepEqual(transform.getPosition(), new Float32Array([0, 0, 0]), 'transform should not change from zero when a dimension is passed ' +
    //                                                         'null, undefined, or zero');
    //         transform.setPosition(null, 0, 0);
    //         t.deepEqual(transform.getPosition(), new Float32Array([0, 0, 0]), 'transform should not change from zero when a dimension is passed ' +
    //                                                         'null, undefined, or zero');
    //         transform.setPosition(null, null, 0);
    //         t.deepEqual(transform.getPosition(), new Float32Array([0, 0, 0]), 'transform should not change from zero when a dimension is passed ' +
    //                                                         'null, undefined, or zero');
    //         transform.setPosition(null, null, null);
    //         t.deepEqual(transform.getPosition(), new Float32Array([0, 0, 0]), 'transform should not change from zero when a dimension is passed ' +
    //                                                         'null, undefined, or zero');
    //         transform.setPosition(null, 0);
    //         t.deepEqual(transform.getPosition(), new Float32Array([0, 0, 0]), 'transform should not change from zero when a dimension is passed ' +
    //                                                         'null, undefined, or zero');
    //
    //         transform.setPosition(0, 1);
    //
    //         t.deepEqual(transform.getPosition(), new Float32Array([0, 1, 0]), 'transform should set the value properly for the given dimension');
    //
    //     }, 'transform should be callable with any number of arguments');
    //
    //     transform.setPosition(1, 2, 3);
    //
    //     t.deepEqual(transform.getPosition(), new Float32Array([1, 2, 3]), 'transform should set the values returned by getPosition');
    //
    //     transform.setPosition();
    //
    //     t.deepEqual(transform.getPosition(), new Float32Array([1, 2, 3]), 'undefined arguments should not change the values stored');
    //
    //     transform.setPosition(null, null, null);
    //
    //     t.deepEqual(transform.getPosition(), new Float32Array([1, 2, 3]), 'null arguments should not change the values stored');
    //
    //     transform.setPosition(0, 0, 0);
    //
    //     t.deepEqual(transform.getPosition(), new Float32Array([0, 0, 0]), 'zero should successfully set the position back to zero');
    //
    //     var node = createTestNode();
    //
    //     transform.setPosition(3, 3, 3);
    //
    //     transform.calculate(node);
    //
    //     t.deepEqual(transform.getLocalTransform(), new Float32Array([
    //                                                 1, 0, 0, 0,
    //                                                 0, 1, 0, 0,
    //                                                 0, 0, 1, 0,
    //                                                 3, 3, 3, 1]), 'position should change the ' +
    //                                                              'result of the calculated matrix');
    //
    //
    //     t.end();
    // });
    //
    // t.test('setRotation method', function (t) {
    //
    //     // todo
    //
    //     t.end();
    // });
    //
    // t.test('setScale method', function (t) {
    //
    //     t.end();
    // });
    //
    // t.test('setAlign method', function (t) {
    //
    //     t.end();
    // });
    //
    // t.test('setMountPoint method', function (t) {
    //
    //     t.end();
    // });
    //
    // t.test('setOrigin method', function (t) {
    //
    //     t.end();
    // });
    //
    // t.test('calculateWorldMatrix', function (t) {
    //
    //     t.end();
    // });
});
