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
var test           = require('tape');
var TestingContext = require('./helpers/ContextWebGL');
var Texture        = require('../Texture');

test('Texture', function(t) {
    t.test('constructor', function(t) {
        var testingContext = new TestingContext();
        var texture = new Texture(testingContext);

        t.ok(texture.id instanceof Object, 'should create a texture object');

        t.equals(testingContext.pixelStorei.callCount, 2, 'should call pixelStorei');
        t.equals(testingContext.bindTexture.callCount, 1, 'should bind the texture');

        t.end();
    });

    t.test('bind', function(t) {
        var testingContext = new TestingContext();
        var texture = new Texture(testingContext);

        t.ok(texture.bind instanceof Function, 'should have a bind method');

        texture.bind();

        t.equals(testingContext.bindTexture.callCount, 2, 'should call the bindTexture method on the context');

        t.end();
    });

    t.test('unbind', function(t) {
        var testingContext = new TestingContext();
        var texture = new Texture(testingContext);

        t.ok(texture.unbind instanceof Function, 'should have a unbind method');

        texture.unbind();

        t.equals(testingContext.bindTexture.callCount, 2, 'should call the bindTexture method on the context');

        t.end();
    });

    t.test('setImage', function(t) {
        var testingContext = new TestingContext();
        var texture = new Texture(testingContext);

        t.ok(texture.setImage instanceof Function, 'should have a setImage method');

        var testImage = {};
        var returned = texture.setImage(testImage);

        t.ok(testingContext.texImage2D.callCount === 1, 'should call the activeTexture method on the context');
        t.ok(testingContext.texImage2D.history[0][5] === testImage, 'should call texImage2D with the passed in image');
        t.ok(returned === texture, 'should be chainable');

        t.end();
    });

    t.test('readBack', function(t) {
        var testingContext = new TestingContext();
        var texture = new Texture(testingContext);

        t.ok(texture.readBack instanceof Function, 'should have a readBack method');

        texture.readBack();

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

        t.equal(testingContext.readPixels.history[1][6].length, width * height * 4, 'should pass an array of width length of width * height * 4 into readPixels');

        t.end();
    });

   t.end();
});
