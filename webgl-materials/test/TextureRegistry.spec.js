'use strict';

var test = require('tape');
var TextureRegistry = require('../src/TextureRegistry');

test('TextureRegistry', function(t) {

    t.test('TextureRegistry.register', function(t) {
        var myTextureData = [];
        var firstTexture = TextureRegistry.register('myFirstTexture', myTextureData);

        t.ok(TextureRegistry.registry['myFirstTexture'], 'Should create a texture object at given key');
        t.ok(firstTexture, 'Should return texture object');
        t.equals(firstTexture.data, myTextureData, 'Should store data in registry');
        t.ok(firstTexture.id, 'Should receive a id');

        var secondTexture = TextureRegistry.register('mySecondTexture', []);

        t.notEquals(firstTexture.id, secondTexture.id, 'Textures should be given unique ids');

        var someTextureOptions = { magFilter: 'LINEAR' };
        var thirdTexture = TextureRegistry.register('myThirdTexture', [], someTextureOptions);

        t.equals(thirdTexture.options, someTextureOptions, 'Should save texture options in registry');

        var fourthTexture = TextureRegistry.register(null, []);

        t.ok(!TextureRegistry.registry[null], 'Should not save texture in registry');
        t.ok(fourthTexture.id, 'Hidden textures should still receive ids');

        TextureRegistry.registry = {};
        TextureRegistry.textureIds = 1;

        t.end();
    });

    t.test('TextureRegistry.get', function(t) {
        t.throws(TextureRegistry.get('textureThatDoesNotExist'), 'Should throw when texture is not found');

        var myTextureData = 'images/ice-cream-sf-band.png';
        var returnedTexture = TextureRegistry.register('textureThatDoesExist', myTextureData);

        var retreivedTexture = TextureRegistry.get('textureThatDoesExist');

        t.equals(retreivedTexture, returnedTexture, 'Should return same texture that was returned');
        t.equals(returnedTexture.data, myTextureData, 'Returned object should contain correct texture data');

        t.end();
    });

    t.end();
});
