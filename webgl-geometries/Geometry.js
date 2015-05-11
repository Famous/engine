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

var GeometryIds = 0;

// WebGL drawing primitives map. This is generated in geometry to 
// avoid chrome deoptimizations in WebGLRenderer draw function.
// TODO: return draw type data retreival to WebGLRenderer.

var DRAW_TYPES = {
    POINTS: 0,
    LINES: 1,
    LINE_LOOP: 2,
    LINE_STRIP: 3,
    TRIANGLES: 4,
    TRIANGLE_STRIP: 5,
    TRIANGLE_FAN: 6
};

/**
 * Geometry is a component that defines the data that should
 * be drawn to the webGL canvas. Manages vertex data and attributes.
 *
 * @class Geometry
 * @constructor
 * 
 * @param {Object} options Instantiation options.
 */
function Geometry(options) {
    this.id = GeometryIds++;
    this.options = options || {};
    this.DEFAULT_BUFFER_SIZE = 3;

    this.spec = {
        id: this.id,
        dynamic: false,
        type: DRAW_TYPES[(this.options.type ? this.options.type.toUpperCase() : 'TRIANGLES')],
        bufferNames: [],
        bufferValues: [],
        bufferSpacings: [],
        invalidations: []
    };

    if (this.options.buffers) {
        var len = this.options.buffers.length;
        for (var i = 0; i < len;) {
            this.spec.bufferNames.push(this.options.buffers[i].name);
            this.spec.bufferValues.push(this.options.buffers[i].data);
            this.spec.bufferSpacings.push(this.options.buffers[i].size || this.DEFAULT_BUFFER_SIZE);
            this.spec.invalidations.push(i++);
        }
    }
}

module.exports = Geometry;
