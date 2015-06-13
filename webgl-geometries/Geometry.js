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

var Serialize = require('../utilities/serialize');

var ComponentFactory = require('../components/ComponentFactory');
ComponentFactory.register(Geometry);

var GeometryIds = 0;

/**
 * Geometry is a component that defines and manages data
 * (vertex data and attributes) that is used to draw to WebGL.
 *
 * @class Geometry
 * @constructor
 *
 * @param {Object} options instantiation options
 * @return {undefined} undefined
 */
function Geometry(options) {
    var spec;
    this.DEFAULT_BUFFER_SIZE = 3;

    options = options || {}
    this.spec = spec = {
        id: GeometryIds++,
        dynamic: options.dynamic || false,
        type: options.type || 'TRIANGLES',
        invalidations : []
    };

    if(options.bufferNames) {
        spec.bufferNames = options.bufferNames = Serialize.deserializeArray(options.bufferNames);
        spec.bufferValues = options.bufferValues = Serialize.deserializeArray(options.bufferValues);
        spec.bufferSpacings = options.bufferSpacings = Serialize.deserializeArray(options.bufferSpacings);

        // WTF: The actual values here are ignored by Mesh.prototype.setGeometry 
        var len = spec.bufferNames.length;
        for (var i = 0; i < len;) {
            spec.invalidations.push(i++);
        }        
    }
    else {
        spec.bufferNames = [];
        spec.bufferValues = [];
        spec.bufferSpacings = [];

        if (options.buffers) {
            var len = options.buffers.length;
            for (var i = 0; i < len;) {
                spec.bufferNames.push(options.buffers[i].name);
                spec.bufferValues.push(options.buffers[i].data);
                spec.bufferSpacings.push(options.buffers[i].size || this.DEFAULT_BUFFER_SIZE);
                // WTF: The actual values here are ignored by Mesh.prototype.setGeometry 
                spec.invalidations.push(i++);
            }
        }
    }
}

/**
 * Serializes the Geometry.  This version is intended as a human editable and
 * diff friendly file format.  Use constructor to deserialize.
 *
 * @method serialize
 *
 * @return {Object}     Serialized representation.
 */
Geometry.prototype._serialize = function _serialize() {
    var t; var spec=this.spec; var result = {_type:"Geometry", _version:1};
    if(spec.dynamic) result.dynamic = true;
    if(spec.type !== 'TRIANGLES') result.type = spec.type;
    result.bufferNames = Serialize.serializeArray(spec.bufferNames);
    result.bufferValues = Serialize.serializeArray(spec.bufferValues);
    result.bufferSpacings = Serialize.serializeArray(spec.bufferSpacings);
    return result;
};

module.exports = Geometry;
