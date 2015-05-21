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

/*
 * A singleton object that holds texture instances in a registry which
 * can be accessed by key.  Allows for texture sharing and easy referencing.
 *
 * @static
 * @class TextureRegistry
 */
var TextureRegistry = {
    registry: {},
    textureIds: 1
};

/*
 * Registers a new Texture object with a unique id and input parameters to be
 * handled by the WebGLRenderer.  If no accessor is input the texture will be
 * created but not store in the registry.
 *
 * @method register
 *
 * @param {String} accessor Key used to later access the texture object.
 * @param {Object | Array | String} data Data to be used in the WebGLRenderer to
 * generate texture data.
 * @param {Object} options Optional parameters to affect the rendering of the
 * WebGL texture.
 *
 * @return {Object} Newly generated texture object.
 */
TextureRegistry.register = function register(accessor, data, options) {
    if (accessor) {
        this.registry[accessor] = { id: this.textureIds++, __isATexture__: true, data: data, options: options };
        return this.registry[accessor];
    }
	else {
        return { id: this.textureIds++, data: data, __isATexture__: true, options: options };
    }
};

/*
 * Retreives the texture object from registry.  Throws if no texture is
 * found at given key.
 *
 * @method get
 *
 * @param {String} accessor Key of a desired texture in the registry.
 *
 * @return {Object} Desired texture object.
 */
TextureRegistry.get = function get(accessor) {
    if (!this.registry[accessor]) {
        throw 'Texture "' + accessor + '" not found!';
    }
    else {
        return this.registry[accessor];
    }
};

module.exports = TextureRegistry;
