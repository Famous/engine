var test = require('tape');
var Transform = require('../src/Transform');

test('Transform', function (t) {
    t.test('constructor', function (t) {
        t.equal(typeof Transform, 'function', 'Transform should be a function');
        t.deepEqual(new Transform().getGlobalMatrix(), [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1], 'Transform\'s matrix should start as the identity matrix');
        t.deepEqual(new Transform().getLocalVectors().translation, [0,0,0], 'Transform\'s translation vector should start as 0,0,0');
        t.deepEqual(new Transform().getLocalVectors().rotation, [0,0,0], 'Transform\'s rotation vector should start as 0,0,0');
        t.deepEqual(new Transform().getLocalVectors().scale, [1,1,1], 'Transform\'s scale vector should start as 1,1,1');
        t.end();
    });

    t.test('getGlobalMatrix method', function (t) {
        var transform = new Transform();
        t.equal(typeof transform.getGlobalMatrix, 'function', 'transform.getGlobalMatrix should be a function');
        t.equal(transform.getGlobalMatrix().length, 16, 'transform.getGlobalMatrix should return a 4x4 matrix');
        t.deepEqual(transform.getGlobalMatrix(), [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1], 'transform.getGlobalMatrix should return the identity matrix if nothing has been changed');
        transform.translate(100, 100, 100);
        transform._update();
        t.notDeepEqual(transform.getGlobalMatrix(), [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1], 'the matrix that .getGlobalMatrix returns should be affected by other methods');
        t.end();
    });

    t.test('getLocalVectors method', function (t) {
        var transform = new Transform();
        t.equal(typeof transform.getLocalVectors, 'function', 'transform.getLocalVectors should be a function');
        t.equal(typeof transform.getLocalVectors(), 'object', 'transform.getLocalVectors should return an object');
        t.ok(
            transform.getLocalVectors().translation[0] != null &&
            transform.getLocalVectors().translation[1] != null &&
            transform.getLocalVectors().translation[2] != null, 'transform.getLocalVectors().translation should return a data structure with values at indexes 0 - 2');
        t.ok(
            transform.getLocalVectors().rotation[0] != null &&
            transform.getLocalVectors().rotation[1] != null &&
            transform.getLocalVectors().rotation[2] != null, 'transform.getLocalVectors().rotation should return a data structure with values at indexes 0 - 2');
        t.ok(
            transform.getLocalVectors().scale[0] != null &&
            transform.getLocalVectors().scale[1] != null &&
            transform.getLocalVectors().scale[2] != null, 'transform.getLocalVectors().scale should return a data structure with values at indexes 0 - 2');
        t.equal(transform.getLocalVectors().translation.length, 3, 'transform.getLocalVectors().translation should return a vector of length 3');
        t.equal(transform.getLocalVectors().rotation.length, 3, 'transform.getLocalVectors().rotation should return a vector of length 3');
        t.equal(transform.getLocalVectors().scale.length, 3, 'transform.getLocalVectors().scale should return a vector of length 3');
        transform.translate(101, 202, 303);
        t.deepEqual(transform.getLocalVectors().translation, [101, 202, 303], 'transform.getLocalVectors().translation should return what the .translate or setTranslation set the translation vector to be');
        transform.setTranslation(303, 202, 101);
        t.deepEqual(transform.getLocalVectors().translation, [303, 202, 101], 'transform.getLocalVectors().translation should return what the .translate or setTranslation set the translation vector to be');
        transform.rotate(2, 1, 3);
        t.deepEqual(transform.getLocalVectors().rotation, [2, 1, 3], 'transform.getLocalVectors().rotation should return what the .rotate or setRotation set the rotation vector to be');
        transform.setRotation(3, 1, 2);
        t.deepEqual(transform.getLocalVectors().rotation, [3, 1, 2], 'transform.getLocalVectors().rotation should return what the .rotate or setRotation set the rotation vector to be');
        transform.scale(2, 1, 3);
        t.deepEqual(transform.getLocalVectors().scale, [3, 2, 4], 'transform.getLocalVectors().scale should return what the .scale or setScale set the scale vector to be');
        transform.setScale(3, 1, 2);
        t.deepEqual(transform.getLocalVectors().scale, [3, 1, 2], 'transform.getLocalVectors().scale should return what the .scale or setScale set the scale vector to be');
        t.end();
    });

    t.test('_update method', function (t) {
        var transform = new Transform();
        t.equal(typeof transform._update, 'function', 'transform._update should be a function');
        t.end();
    });

    t.test('translate method', function (t) {
        var transform = new Transform();
        t.equal(typeof transform.translate, 'function', 'transform.translate should be a function');
        for (var i = 0 ; i < 10 ; i++) {
            t.deepEqual(transform.getLocalVectors().translation, [101 * i, 202 * i, 303 * i], 'transform.translate should increase the translation vector by the amount passed in');
            transform.translate(101, 202, 303);
        }
        t.doesNotThrow(function() {
                transform.translate(0, 5);
                transform.translate(void 0, 5);
        }, 'transform.translate should not throw an error if passed falsy values for any argument');
        t.doesNotThrow(function() {
                transform.translate(0, 0, 5);
                transform.translate(0, void 0, 5);
        }, 'transform.translate should not throw an error if passed falsy values for any argument');
        t.doesNotThrow(function() {
                transform.translate(0,0, 0);
                transform.translate(0,0, void 0);
        }, 'transform.translate should not throw an error if passed falsy values for any argument');
        t.end();
    });

    t.test('rotate method', function (t) {
        var transform = new Transform();
        t.equal(typeof transform.rotate, 'function', 'transform.rotate should be a function');
        for (var i = 0 ; i < 10 ; i++) {
            t.deepEqual(transform.getLocalVectors().rotation, [101 * i, 202 * i, 303 * i], 'transform.rotate should increase the rotation vector by the amount passed in');
            transform.rotate(101, 202, 303);
        }
        t.doesNotThrow(function() {
                transform.rotate(0, 5);
                transform.rotate(void 0, 5);
        }, 'transform.rotate should not throw an error if passed falsy values for any argument');
        t.doesNotThrow(function() {
                transform.rotate(0, 0, 5);
                transform.rotate(0, void 0, 5);
        }, 'transform.rotate should not throw an error if passed falsy values for any argument');
        t.doesNotThrow(function() {
                transform.rotate(0,0, 0);
                transform.rotate(0,0, void 0);
        }, 'transform.rotate should not throw an error if passed falsy values for any argument');
        t.end();
    });

    t.test('scale method', function (t) {
        var transform = new Transform();
        t.equal(typeof transform.scale, 'function', 'transform.scale should be a function');
        for (var i = 0 ; i < 10 ; i++) {
            t.deepEqual(transform.getLocalVectors().scale, [101 * i + 1, 202 * i + 1, 303 * i + 1], 'transform.rotate should increase the scale vector by the amount passed in');
            transform.scale(101, 202, 303);
        }
        t.doesNotThrow(function() {
                transform.scale(0, 5);
                transform.scale(void 0, 5);
        }, 'transform.scale should not throw an error if passed falsy values for any argument');
        t.doesNotThrow(function() {
                transform.scale(0, 0, 5);
                transform.scale(0, void 0, 5);
        }, 'transform.scale should not throw an error if passed falsy values for any argument');
        t.doesNotThrow(function() {
                transform.scale(0,0, 0);
                transform.scale(0,0, void 0);
        }, 'transform.scale should not throw an error if passed falsy values for any argument');
        t.end();
    });

    t.test('setTranslation method', function (t) {
        var transform = new Transform();
        t.equal(typeof transform.setTranslation, 'function', 'transform.setTranslation should be a function');
        for (var i = 0 ; i < 10 ; i++) {
            transform.setTranslation(100, 100, 100);
            t.deepEqual(transform.getLocalVectors().translation, [100, 100, 100], 'transform.setTranslation should set the translation vector to a value');
        }
        t.doesNotThrow(function() {
                transform.setTranslation(0, 5);
                transform.setTranslation(void 0, 5);
        }, 'transform.setTranslation should not throw an error if passed falsy values for any argument');
        t.doesNotThrow(function() {
                transform.setTranslation(0, 0, 5);
                transform.setTranslation(0, void 0, 5);
        }, 'transform.setTranslation should not throw an error if passed falsy values for any argument');
        t.doesNotThrow(function() {
                transform.setTranslation(0,0, 0);
                transform.setTranslation(0,0, void 0);
        }, 'transform.setTranslation should not throw an error if passed falsy values for any argument');
        t.end();
    });

    t.test('setRotation method', function (t) {
        var transform = new Transform();
        t.equal(typeof transform.setRotation, 'function', 'transform.setRotation should be a function');
        for (var i = 0 ; i < 10 ; i++) {
            transform.setRotation(100, 100, 100);
            t.deepEqual(transform.getLocalVectors().rotation, [100, 100, 100], 'transform.setRotation should set the translation vector to a value');
        }
        t.doesNotThrow(function() {
                transform.setRotation(0, 5);
                transform.setRotation(void 0, 5);
        }, 'transform.setRotation should not throw an error if passed falsy values for any argument');
        t.doesNotThrow(function() {
                transform.setRotation(0, 0, 5);
                transform.setRotation(0, void 0, 5);
        }, 'transform.setRotation should not throw an error if passed falsy values for any argument');
        t.doesNotThrow(function() {
                transform.setRotation(0,0, 0);
                transform.setRotation(0,0, void 0);
        }, 'transform.setRotation should not throw an error if passed falsy values for any argument');
        t.end();
    });

    t.test('setScale method', function (t) {
        var transform = new Transform();
        t.equal(typeof transform.setScale, 'function', 'transform.setScale should be a function');
        for (var i = 0 ; i < 10 ; i++) {
            transform.setScale(100, 100, 100);
            t.deepEqual(transform.getLocalVectors().scale, [100, 100, 100], 'transform.setScale should set the translation vector to a value');
        }
        t.doesNotThrow(function() {
                transform.setScale(0, 5);
                transform.setScale(void 0, 5);
        }, 'transform.setScale should not throw an error if passed falsy values for any argument');
        t.doesNotThrow(function() {
                transform.setScale(0, 0, 5);
                transform.setScale(0, void 0, 5);
        }, 'transform.setScale should not throw an error if passed falsy values for any argument');
        t.doesNotThrow(function() {
                transform.setScale(0,0, 0);
                transform.setScale(0,0, void 0);
        }, 'transform.setScale should not throw an error if passed falsy values for any argument');
        t.end();
    });

    t.test('getTranslation method', function(t) {
        var transform = new Transform();
        t.equal(typeof transform.getTranslation, 'function', 'transform.getTranslation should be a function');
        t.end();
    });

    t.test('getScale method', function(t) {
        var transform = new Transform();
        t.equal(typeof transform.getScale, 'function', 'transform.getScale should be a function');
        t.end();
    });

    t.test('getRotation method', function(t) {
        var transform = new Transform();
        t.equal(typeof transform.getRotation, 'function', 'transform.getRotation should be a function');
        t.end();
    });

    t.test('toIdentity method', function(t) {
        var transform = new Transform();
        t.equal(typeof transform.toIdentity, 'function', 'transform.toIdentity should be a function');
        t.end();
    });
});
