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
var WebGLRenderer = require('../WebGLRenderer');

function createCanvas () {
    return document.createElement('canvas');
}

function createCompositor () {
    return {
        getTime: function() {
            return 0;
        }
    };
}

test('WebGLRenderer', function (t) {
    t.test('constructor', function (t) {
        var canvas = createCanvas();
        var compositor = createCompositor();

        t.equal(typeof WebGLRenderer, 'function', 'WebGLRenderer should be a constructor function');

        t.doesNotThrow(function () {
            new WebGLRenderer(canvas, compositor);
        }, 'Instantiating a new WebGLRenderer should not throw an error');

        t.end();
    });

    t.test('getWebGLContext method', function (t) {
        var canvas = createCanvas();
        var compositor = createCompositor();
        var webGLRenderer = new WebGLRenderer(canvas, compositor);

        var context;

        t.equal(typeof webGLRenderer.getWebGLContext, 'function', 'webGLRenderer.getWebGLContext should be a function');

        t.doesNotThrow(function () {
            context = webGLRenderer.getWebGLContext(canvas);
        }, 'WebGLRenderer#getWebGLContext should not throw an error');

        t.equal(context.constructor, WebGLRenderingContext, 'retrieved GL context should be a WebGLRenderingContext');

        t.end();
    });

    t.test('createLight method', function (t) {
        var webGLRenderer = new WebGLRenderer(createCanvas(), createCompositor());

        t.equal(typeof webGLRenderer.createLight, 'function', 'webGLRenderer.createLight should be a function');

        t.deepEqual(
            webGLRenderer.createLight('path/1/2/3'),
            { color: [ 0, 0, 0 ], position: [ 0, 0, 0 ] }
        );

        t.end();
    });

    t.test('createMesh method', function (t) {
        var webGLRenderer = new WebGLRenderer(createCanvas(), createCompositor());

        t.equal(typeof webGLRenderer.createMesh, 'function', 'webGLRenderer.createMesh should be a function');

        t.deepEqual(
            webGLRenderer.createMesh('path/1/2/3'),
            {
                depth: null,
                uniformKeys: [
                    'u_opacity',
                    'u_transform',
                    'u_size',
                    'u_baseColor',
                    'u_positionOffset',
                    'u_normals',
                    'u_flatShading',
                    'u_glossiness'
                ],
                uniformValues: [
                    1,
                    [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
                    [ 0, 0, 0 ],
                    [ 0.5, 0.5, 0.5, 1 ],
                    [ 0, 0, 0 ],
                    [ 0, 0, 0 ],
                    0,
                    [ 0, 0, 0, 0 ]
                ],
                buffers: {},
                geometry: null,
                drawType: null,
                textures: [],
                visible: true
            }
        );

        t.end();
    });

    t.test('getOrSetCutout method', function (t) {
        var webGLRenderer = new WebGLRenderer(createCanvas(), createCompositor());

        t.equal(typeof webGLRenderer.getOrSetCutout, 'function', 'webGLRenderer.getOrSetCutout should be a function');

        var setCutout = webGLRenderer.getOrSetCutout('path/1/2/3');

        t.deepEqual(setCutout, {
            uniformKeys: [
                'u_opacity',
                'u_transform',
                'u_size',
                'u_origin',
                'u_baseColor'
            ],
            uniformValues: [
                0,
                [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
                [ 0, 0, 0 ],
                [ 0, 0, 0 ],
                [ 0, 0, 0, 1 ]
            ],
            geometry: -1,
            drawType: 'TRIANGLE_STRIP',
            visible: true
        }, 'webGLRenderer.getOrSetCutout should create a new cutout if none is available at the specified path');

        var getCutout = webGLRenderer.getOrSetCutout('path/1/2/3');

        t.equal(setCutout, getCutout, 'webGLRenderer.getOrSetCutout should return previously created cutout if available');
        t.end();
    });

    t.test('setMeshVisibility method', function (t) {
        var webGLRenderer = new WebGLRenderer(createCanvas(), createCompositor());

        t.equal(typeof webGLRenderer.setMeshVisibility, 'function', 'webGLRenderer.setMeshVisibility should be a function');

        t.doesNotThrow(function() {
            webGLRenderer.setMeshVisibility('path/1/2/3', true);
        }, 'webGLRenderer.setMeshVisibility should not throw an error if no mesh has previously been created at the specified path');

        t.end();
    });
});
