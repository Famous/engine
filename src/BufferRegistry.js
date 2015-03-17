'use strict';

var INDICES = 'indices';

var Buffer = require('./Buffer');

/**
 * BufferRegistry is a class that manages allocation of buffers to
 * input geometries.
 * 
 * @class BufferRegistry
 * @constructor
 * 
 * @param {WebGLContext} context WebGL drawing context to be passed to buffers.
 */
function BufferRegistry(context) {
    this.gl = context;

    this.registry = {};
    this._dynamicBuffers = [];
    this._staticBuffers = [];
    
    this._arrayBufferMax = 30000;
    this._elementBufferMax = 30000;
}

/**
 * Binds and fills all the vertex data into webgl buffers.  Will reuse buffers if
 * possible.  Populates registry with the name of the buffer, the WebGL buffer
 * object, spacing of the attribute, the attribute's offset within the buffer, 
 * and finally the length of the buffer.  This information is later accessed by
 * the root to draw the buffers.
 *
 * @method allocate
 *
 * @param {Number} geometryId Id of the geometry instance that holds the buffers.
 * @param {String} name Key of the input buffer in the geometry.
 * @param {Array} value Flat array containing input data for buffer.
 * @param {Number} spacing The spacing, or itemSize, of the input buffer.
 * @param {Boolean} dynamic Boolean denoting whether a geometry is dynamic or static.
 */
BufferRegistry.prototype.allocate = function allocate(geometryId, name, value, spacing, dynamic) {
    var vertexBuffers = this.registry[geometryId] || (this.registry[geometryId] = { keys: [], values: [], spacing: [], offset: [], length: [] });

    var j = vertexBuffers.keys.indexOf(name);
    var isIndex = name === INDICES;
    var bufferFound = false;
    var newOffset;
    var offset = 0;
    var length;
    var buffer;
    var k;

    if (j === -1) {
        j = vertexBuffers.keys.length;
        length = isIndex ? value.length : Math.floor(value.length / spacing);

        if (dynamic) {

            // Use a previously created buffer if available.

            for (k = 0; k < this._staticBuffers.length; k++) {
                
                if (isIndex === this._staticBuffers[k].isIndex) {
                    newOffset = this._staticBuffers[k].offset + value.length;
                    if ((!isIndex && newOffset < this._arrayBufferMax) || (isIndex && newOffset < this._elementBufferMax)) {
                        buffer = this._staticBuffers[k].buffer;
                        offset = this._staticBuffers[k].offset;
                        this._staticBuffers[k].offset += value.length;
                        bufferFound = true;
                        break;
                    }
                }
            }

            // Create a new static buffer in none were found.

            if (!bufferFound) {
                buffer = new Buffer(
                    isIndex ? this.gl.ELEMENT_ARRAY_BUFFER : this.gl.ARRAY_BUFFER,
                    isIndex ? Uint16Array : Float32Array,
                    this.gl
                );

                this._staticBuffers.push({ buffer: buffer, offset: value.length, isIndex: isIndex });
            }
        }
        else {

            // For dynamic geometries, always create new buffer.

            buffer = new Buffer(
                isIndex ? this.gl.ELEMENT_ARRAY_BUFFER : this.gl.ARRAY_BUFFER,
                isIndex ? Uint16Array : Float32Array,
                this.gl
            );

            this._dynamicBuffers.push({ buffer: buffer, offset: value.length });
        }

        // Update the registry for the spec with buffer information.

        vertexBuffers.keys.push(name);
        vertexBuffers.values.push(buffer);
        vertexBuffers.spacing.push(spacing);
        vertexBuffers.offset.push(offset);
        vertexBuffers.length.push(length);
    }
    
    var len = value.length;
    for (var k = 0; k < len; k++) {
        vertexBuffers.values[j].data[offset + k] = value[k];
    }
    vertexBuffers.values[j].subData();
};

module.exports = BufferRegistry;
