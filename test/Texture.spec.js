'use strict';
var test           = require('tape');
var TestingContext = require('./WebGLTestingContext');
var Texture        = require('../../../src/gl/Texture');

test('Texture', function(t) {
    t.test('constructor', function(t) {
        var testingContext = new TestingContext();
        var texture = new Texture(testingContext);

        t.ok(texture.id instanceof Object, 'should create a texture object');

        t.ok(testingContext.texImage2D.callCount === 1, 'should call texImage2D');
        t.ok(testingContext.texImage2D.history[0][8] === null, 'should call texImage2D with a null value');

        t.ok(testingContext.pixelStorei.callCount === 1, 'should call pixelStorei');
        t.ok(testingContext.bindTexture.callCount === 1, 'should bind the texture');

        t.end();
    });

    t.test('bind', function(t) {
        var testingContext = new TestingContext();
        var texture = new Texture(testingContext);

        t.ok(texture.bind instanceof Function, 'should have a bind method');

        texture.bind();

        t.ok(testingContext.activeTexture.callCount === 1, 'should call the activeTexture method on the context');
        t.ok(testingContext.bindTexture.callCount === 2, 'should call the bindTexture method on the context');

        texture.bind(5);
        t.equal(testingContext.activeTexture.history[1][0], 33989, 'should call activeTexture with correct texture slot')

        t.end();
    });

    t.test('unbind', function(t) {
        var testingContext = new TestingContext();
        var texture = new Texture(testingContext);

        t.ok(texture.unbind instanceof Function, 'should have a unbind method');

        texture.unbind();

        t.ok(testingContext.activeTexture.callCount === 1, 'should call the activeTexture method on the context');
        t.ok(testingContext.bindTexture.callCount === 2, 'should call the bindTexture method on the context');

        texture.bind(5);
        t.equal(testingContext.activeTexture.history[1][0], 33989, 'should call activeTexture with correct texture slot')

        t.end();
    });

    t.test('setImage', function(t) {
        var testingContext = new TestingContext();
        var texture = new Texture(testingContext);

        t.ok(texture.setImage instanceof Function, 'should have a setImage method');

        var testImage = {};
        var returned = texture.setImage(testImage);

        t.ok(testingContext.texImage2D.callCount === 2, 'should call the activeTexture method on the context');
        t.ok(testingContext.texImage2D.history[1][5] === testImage, 'should call texImage2D with the passed in image');
        t.ok(returned === texture, 'should be chainable');

        t.end();
    });

    t.test('readBack', function(t) {
        var testingContext = new TestingContext();
        var texture = new Texture(testingContext);

        t.ok(texture.readBack instanceof Function, 'should have a readBack method');

        var returned = texture.readBack();

        t.ok(testingContext.createFramebuffer.callCount === 1, 'should call createFrameBuffer on the context');
        t.ok(testingContext.bindFramebuffer.callCount === 1, 'should call bindFramebuffer on the context');
        t.ok(testingContext.framebufferTexture2D.callCount === 1, 'should call framebufferTexture2D on the context');

        t.ok(testingContext.readPixels.callCount === 1, 'should call readPixels when FRAMEBUFFER_COMPLETE');
        t.ok(
            testingContext.readPixels.history[0][0] === 0 &&
                testingContext.readPixels.history[0][1] === 0,
            'should default x and y input to 0, 0'
        );
        t.ok(
            testingContext.readPixels.history[0][2] === 0 &&
                testingContext.readPixels.history[0][3] === 0,
            'should default width and height input to 0, 0'
        );

        var width = 15;
        var height = 20;
        texture.readBack(5, 10, 15, 20);
        t.ok(
            testingContext.readPixels.history[1][0] === 5 &&
                testingContext.readPixels.history[1][1] === 10 &&
                testingContext.readPixels.history[1][2] === 15 &&
                testingContext.readPixels.history[1][3] === 20,
            'should use input values as arguments to readBack'
        );

        t.equal(testingContext.readPixels.history[1][6].length, width * height * 4, 'should pass an array of width length of width * height * 4 into readPixels')

        t.end();
    });

    t.end();
});
