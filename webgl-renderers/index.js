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
define([
    'famous/webgl-renderers/Buffer',
    'famous/webgl-renderers/BufferRegistry',
    'famous/webgl-renderers/compileMaterial',
    'famous/webgl-renderers/createCheckerboard',
    'famous/webgl-renderers/Debug',
    'famous/webgl-renderers/radixSort',
    'famous/webgl-renderers/Texture',
    'famous/webgl-renderers/TextureManager',
    'famous/webgl-renderers/WebGLRenderer'
    ], function ( Buffer, BufferRegistry, compileMaterial, createCheckerboard, Debug, radixSort, Texture, TextureManager, WebGLRenderer ) {

return {
    Buffer: Buffer,
    BufferRegistry: BufferRegistry,
    compileMaterial: compileMaterial,
    createCheckerboard: createCheckerboard,
    Debug: Debug,
    radixSort: radixSort,
    Texture: Texture,
    TextureManager: TextureManager,
    WebGLRenderer: WebGLRenderer
};
});
