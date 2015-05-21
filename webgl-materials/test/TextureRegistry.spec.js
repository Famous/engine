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
var TextureRegistry = require('../TextureRegistry');

test('TextureRegistry', function(t) {

    t.test('TextureRegistry.register', function(t) {
        var myTextureData = [];
        var firstTexture = TextureRegistry.register('myFirstTexture', myTextureData);

        t.ok(TextureRegistry.registry.myFirstTexture, 'Should create a texture object at given key');
        t.ok(firstTexture, 'Should return texture object');
        t.equals(firstTexture.data, myTextureData, 'Should store data in registry');
        t.ok(firstTexture.id, 'Should receive a id');

        var secondTexture = TextureRegistry.register('mySecondTexture', []);

        t.notEquals(firstTexture.id, secondTexture.id, 'Textures should be given unique ids');

        var someTextureOptions = { magFilter: 'LINEAR' };
        var thirdTexture = TextureRegistry.register('myThirdTexture', [], someTextureOptions);

        t.equals(thirdTexture.options, someTextureOptions, 'Should save texture options in registry');

        var fourthTexture = TextureRegistry.register(null, []);

        t.ok(!TextureRegistry.registry.null, 'Should not save texture in registry');
        t.ok(fourthTexture.id, 'Hidden textures should still receive ids');

        TextureRegistry.registry = {};
        TextureRegistry.textureIds = 1;

        t.end();
    });

    t.test('TextureRegistry.get', function(t) {
        t.throws(function() {
            TextureRegistry.get('textureThatDoesNotExist');
        }, 'Should throw when texture is not found');

        var myTextureData = 'images/ice-cream-sf-band.png';
        var returnedTexture = TextureRegistry.register('textureThatDoesExist', myTextureData);

        var retreivedTexture = TextureRegistry.get('textureThatDoesExist');

        t.equals(retreivedTexture, returnedTexture, 'Should return same texture that was returned');
        t.equals(returnedTexture.data, myTextureData, 'Returned object should contain correct texture data');

        t.end();
    });

    t.end();
});
