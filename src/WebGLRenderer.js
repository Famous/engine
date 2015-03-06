'use strict';

var Texture = require('./Texture');
var Program = require('./Program');
var Buffer = require('./Buffer');
var BufferRegistry = require('./BufferRegistry');
var checkers = require('./Checkerboard');

var uniformNames = ['perspective', 'transform', 'opacity', 'origin', 'size', 'baseColor', 'time'];
var resolutionName = ['resolution'];
var uniformValues = [];
var resolutionValues = [];

var inputIdx = { baseColor: 0, normal: 1, metalness: 2, glossiness: 3, positionOffset: 4};
var inputNames = ['baseColor', 'normal', 'metalness', 'glossiness', 'positionOffset'];
var inputValues = [[.5, .5, .5], [0,0,0], .2, .8, .8];
var identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

/**
 * WebGLRenderer is a private class that reads commands from a Mesh
 * and converts them into webGL api calls.
 *
 * @class WebGLRenderer
 * @constructor
 *
 * @param {DOMElement} canvas The dom element that GL will paint itself onto.
 *
 */
function WebGLRenderer(container) {
    this.container = container;
    this.canvas = document.createElement('canvas');

    if (this.container.getTarget() === document.body) {
        window.addEventListener('resize', this.updateSize.bind(this));
    }

    this.container.getTarget().appendChild(this.canvas);
    this.canvas.className = 'famous-webgl GL';

    var gl = this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    var containerSize = this.container._getSize();

    gl.polygonOffset(0.1, 0.1);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.depthFunc(gl.LEQUAL);

    this.meshRegistry = {};
    this.meshRegistryKeys = [];
    this.lightRegistry = {};
    this.lightRegistryKeys = [];
    this.textureRegistry = {};
    this.texCache = {};
    this.bufferRegistry = new BufferRegistry(gl);
    this.program = new Program(gl);

    this.state = {
        boundArrayBuffer: null,
        boundElementBuffer: null,
        lastDrawn: null,
        enabledAttributes: {},
        enabledAttributesKeys: []
    };

    this.resolutionName = ['resolution'];
    this.resolutionValues = [];

    this.cachedSize = [];
    this.updateSize();

    this.projectionTransform = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

/**
 * Draws a mesh onto the screen
 *
 * @method render
 *
 * @param {Context} object with local transform data and mesh
 *
 * @chainable
 */
WebGLRenderer.prototype.receive = function receive(path, commands) {
    var bufferName, bufferValue, bufferSpacing, uniformName, uniformValue, geometryId;
    var mesh = this.meshRegistry[path];
    var light = this.lightRegistry[path];

    var bufferName;
    var bufferValue;
    var bufferSpacing;
    var uniformName;
    var uniformValue;
    var geometryId;

    var command = commands.shift();

<<<<<<< HEAD
    switch (command) {
        case 'GL_SET_DRAW_OPTIONS':
            mesh.options = commands.shift();
            break;

        case 'GL_CREATE_MESH':
            mesh = this.meshRegistry[path] = {
                uniformKeys: ['opacity', 'transform', 'size', 'origin', 'baseColor'],
                uniformValues: [1, identity, [0, 0, 0], [0, 0, 0], [0.5, 0.5, 0.5]],
                buffers: {},
                geometry: null,
                drawType: null
            };
            this.meshRegistryKeys.push(path);
            break;

        case 'GL_CREATE_LIGHT':
            light = this.lightRegistry[path] = {
                color: [1.0, 1.0, 1.0],
                position: [0.0, 0.0, 100.0]
            };
            this.lightRegistryKeys.push(path);
            break;

        case 'GL_LIGHT_POSITION':
            var transform = commands.shift();
            light.position[0] = transform[12];
            light.position[1] = transform[13];
            light.position[2] = transform[14];
            break;

        case 'GL_LIGHT_COLOR':
            var color = commands.shift();
            light.color[0] = color[0];
            light.color[1] = color[1];
            light.color[2] = color[2];
            break;

        case 'MATERIAL_INPUT':
            var name = commands.shift();
            var mat = commands.shift();
            mesh.uniformValues[name == 'baseColor' ? 4 : 5][0] = -mat._id;
            this.program.registerMaterial(name, mat);
            this.updateSize();
            break;

        case 'GL_SET_GEOMETRY':
            mesh.geometry = commands.shift();
            mesh.drawType = commands.shift();
            mesh.dynamic = commands.shift();
            break;

        case 'GL_UNIFORMS':
            uniformName = commands.shift();
            uniformValue = commands.shift();
            var index = mesh.uniformKeys.indexOf(uniformName);

            if (index === -1) {
                mesh.uniformKeys.push(uniformName);
                mesh.uniformValues.push(uniformValue);
            } else {
                mesh.uniformValues[index] = uniformValue;
            }
            break;

        case 'GL_BUFFER_DATA':
            geometryId = commands.shift();
            bufferName = commands.shift();
            bufferValue = commands.shift();
            bufferSpacing = commands.shift();

            this.bufferRegistry.allocate(geometryId, bufferName, bufferValue, bufferSpacing);
            break;

        default: commands.unshift(command); return;
=======
    while (commands.length) {
        var command = commands.shift();

        switch (command) {
            case 'GL_SET_DRAW_OPTIONS':
                var x = commands.shift();
                mesh.options = x;
                break;

            case 'GL_CREATE_MESH':
                mesh = this.meshRegistry[path] = {
                    uniformKeys: ['opacity', 'transform', 'size', 'origin', 'baseColor', 'positionOffset'],
                    uniformValues: [1, identity, [0, 0, 0], [0, 0, 0], [0.5, 0.5, 0.5], [0,0,0]],
                    buffers: {},
                    options: {},
                    geometry: null,
                    drawType: null,
                    texture: null
                };
                this.meshRegistryKeys.push(path);
                break;

            case 'GL_CREATE_LIGHT':
                light = this.lightRegistry[path] = {
                    color: [1.0, 1.0, 1.0],
                    position: [0.0, 0.0, 100.0]
                };
                this.lightRegistryKeys.push(path);
                break;

            case 'GL_LIGHT_POSITION':
                var transform = commands.shift();
                light.position[0] = transform[12];
                light.position[1] = transform[13];
                light.position[2] = transform[14];
                break;

            case 'GL_LIGHT_COLOR':
                var color = commands.shift();
                light.color[0] = color[0];
                light.color[1] = color[1];
                light.color[2] = color[2];
                break;

            case 'MATERIAL_INPUT':
                var name = commands.shift();
                var mat = commands.shift();
                mesh.uniformValues[name == 'baseColor' ? 4 : 5][0] = -mat._id;
                this.updateSize();
                mesh.texture = handleImage.call(this, mat);
                this.program.registerMaterial(name, mat);
                break;

            case 'GL_SET_GEOMETRY':
                mesh.geometry = commands.shift();
                mesh.drawType = commands.shift();
                mesh.dynamic = commands.shift();
                break;

            case 'GL_UNIFORMS':
                uniformName = commands.shift();
                uniformValue = commands.shift();
                var index = mesh.uniformKeys.indexOf(uniformName);

                if (index === -1) {
                    mesh.uniformKeys.push(uniformName);
                    mesh.uniformValues.push(uniformValue);
                } else {
                    mesh.uniformValues[index] = uniformValue;
                }
                break;

            case 'GL_BUFFER_DATA':
                geometryId = commands.shift();
                bufferName = commands.shift();
                bufferValue = commands.shift();
                bufferSpacing = commands.shift();

                this.bufferRegistry.allocate(geometryId, bufferName, bufferValue, bufferSpacing);
                break;

            case 'WITH': commands.unshift(command); return;
        }
>>>>>>> fix:correctly bind textures before upload and cleanup
    }
};

WebGLRenderer.prototype.draw = function draw(renderState) {
    var mesh;
    var buffers;
    var size;
    var light;
    var i;
    var len;

    for (i = 0, len = this.lightRegistryKeys.length; i < len; i++) {
        light = this.lightRegistry[this.lightRegistryKeys[i]];
        this.program.setUniforms(['u_LightPosition'], [light.position]);
        this.program.setUniforms(['u_LightColor'], [light.color]);
    }

    this.projectionTransform[11] = renderState.perspectiveTransform[11];
    this.program.setUniforms(['perspective'], [this.projectionTransform]);

    for (i = 0, len = this.meshRegistryKeys.length; i < len; i++) {
        mesh = this.meshRegistry[this.meshRegistryKeys[i]];

        buffers = this.bufferRegistry.registry[mesh.geometry];

        if (mesh.texture) mesh.texture.bind();

        this.program.setUniforms(mesh.uniformKeys, mesh.uniformValues);

        this.handleOptions(mesh.options);
        
        this.drawBuffers(buffers, mesh.drawType, mesh.geometry);

        if (mesh.texture) mesh.texture.unbind();

        this.resetOptions(mesh.options);
    }
};


/**
 * Loads the buffers and issues the draw command for a geometry
 *
 * @method drawBuffers
 *
 * @param {Object} Map of vertex buffers keyed by attribute identifier
 * @param {Number} Enumerator defining what primitive to draw
 *
 */
WebGLRenderer.prototype.drawBuffers = function drawBuffers(vertexBuffers, mode, id) {
    var gl = this.gl;
    var length = 0;
    var attribute;
    var location;
    var spacing;
    var offset;
    var buffer;
    var iter;
    var j;

    iter = vertexBuffers.keys.length;
    for (var i = 0; i < iter; i++) {
        attribute = vertexBuffers.keys[i];

        // Do not set vertexAttribPointer if index buffer.

        if (attribute === 'indices') {
            j = i; continue;
        }

        // Retreive the attribute location and make sure it is enabled.

        location = this.program.attributeLocations[attribute];

        if (location === -1) continue;
        if (location === undefined) {
            location = gl.getAttribLocation(this.program.program, attribute);
            this.program.attributeLocations[attribute] = location;
            if (location === -1) continue;
        }

        if (!this.state.enabledAttributes[attribute]) {
            gl.enableVertexAttribArray(location);
            this.state.enabledAttributes[attribute] = true;
            this.state.enabledAttributesKeys.push(attribute);
        }

        // Retreive buffer information used to set attribute pointer.

        buffer = vertexBuffers.values[i];
        spacing = vertexBuffers.spacing[i];
        offset = vertexBuffers.offset[i];
        length = vertexBuffers.length[i];

        // Skip bindBuffer if buffer is currently bound.

        if (this.state.boundArrayBuffer !== buffer) {
            gl.bindBuffer(buffer.target, buffer.buffer);
            this.state.boundArrayBuffer = buffer;
        }

        if (this.state.lastDrawn !== id) {
            gl.vertexAttribPointer(location, spacing, gl.FLOAT, gl.FALSE, 0, 4 * offset);
        }
    }

    // Disable any attributes that not currently being used.
    for(var i = 0, len = this.state.enabledAttributesKeys.length; i < len; i++) {
        var key = this.state.enabledAttributes[this.state.enabledAttributesKeys[i]];
        if (this.state.enabledAttributes[key] && vertexBuffers.keys.indexOf(key) === -1) {
            gl.disableVertexAttribArray(this.program.attributeLocations[key]);
            this.state.enabledAttributes[key] = false;
        }
    }

    if (length) {
        // If index buffer, use drawElements.

        if (j !== undefined) {
            buffer = vertexBuffers.values[j];
            offset = vertexBuffers.offset[j];
            spacing = vertexBuffers.spacing[j];
            length = vertexBuffers.length[j];

            // Skip bindBuffer if buffer is currently bound.

            if (this.state.boundElementBuffer !== buffer) {
                gl.bindBuffer(buffer.target, buffer.buffer);
                this.state.boundElementBuffer = buffer;
            }

            gl.drawElements(mode, length, gl.UNSIGNED_SHORT, 2 * offset);
        }
        else {
            gl.drawArrays(mode, 0, length);
        }
    }

    this.state.lastDrawn = id;
};

/**
 * Allocates an array buffer where vertex data is sent to via compile.
 *
 * @method renderOffscreen
 *
 * @param {Function} The render function to be called after setup and before cleanup
 * @param {spec} The object containing mesh data
 * @param {context} The object containing global render information
 * @param {Texture} The location where the render data is stored
 *
 */
function renderOffscreen(callback, size, texture) {
    var gl = this.gl;

    var framebuffer  = this.framebuffer ? this.framebuffer : this.framebuffer = gl.createFramebuffer();
    var renderbuffer = this.renderbuffer ? this.renderbuffer : this.renderbuffer = gl.createRenderbuffer();

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);

    if (size[0] != renderbuffer.width || size[1] != renderbuffer.height) {
        renderbuffer.width = size[0];
        renderbuffer.height = size[1];
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, size[0], size[1]);
    }

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture.id, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

    if (this.debug) checkFrameBufferStatus(gl);

    callback.call(this);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
};

/**
 * Diagonose the failed intialization of an FBO
 *
 * @method checkFrameBufferStatus
 *
 * @param {Object} the glContext that owns this FBO
 *
 */
function checkFrameBufferStatus(gl) {
    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

    switch (status) {
        case gl.FRAMEBUFFER_COMPLETE:
            break;
        case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
            throw("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT"); break;
        case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
            throw("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT"); break;
        case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
            throw("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS"); break;
        case gl.FRAMEBUFFER_UNSUPPORTED:
            throw("Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED"); break;
        default:
            throw("Incomplete framebuffer: " + status);
    }
};

/**
 * Updates the width and height of parent canvas, sets the viewport size on
 * the WebGL context and updates the resolution uniform for the shader program.
 * If no size is passed in this function will update using the cached size.
 *
 * @method updateSize
 *
 * @param {Number} width Updated width of the drawing context.
 * @param {Number} height Updated height of the drawing context.
 * @param {Number} depth Updated depth of the drawing context.
 *
 */
WebGLRenderer.prototype.updateSize = function updateSize() {
    var newSize = this.container._getSize();

    var width = newSize[0];
    var height = newSize[1];

    this.cachedSize[0] = width;
    this.cachedSize[1] = height;
    this.cachedSize[2] = (width > height) ? width : height;

    this.canvas.width  = width;
    this.canvas.height = height;

    this.gl.viewport(0, 0, this.cachedSize[0], this.cachedSize[1]);

    this.resolutionValues[0] = this.cachedSize;
    this.program.setUniforms(this.resolutionName, this.resolutionValues);
};

module.exports = WebGLRenderer;

function IDL(){
    var onLoadEnvironment = function (xhr, gl) {

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
        if (xhr.status !== 200) return;
        this.texture0 = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture0);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1024, 1024, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(xhr.response));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'luv.bin', true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = onLoadEnvironment.bind(this, xhr, this.gl);
    xhr.send(null);
}

WebGLRenderer.prototype.handleOptions = function handleOptions(options) {
    var gl = this.gl;
    if (options.blending) gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
};

WebGLRenderer.prototype.resetOptions = function handleOptions(options) {
    var gl = this.gl;
    if (options.blending) gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
};

function loadImage (img, callback) {
    var obj = (typeof img === 'string' ? new Image() : img) || {};
    obj.crossOrigin = 'anonymous';
    if (! obj.src) obj.src = img;
    if (! obj.complete) obj.onload = function () { callback(obj); };
    else callback(obj);
    return obj;
}

function handleImage(material) {
    if (! material.uniforms.image) return;
    var t = new Texture(this.gl);
    
    t.src = material.uniforms.image;
    t.setImage(checkers);
    loadImage(material.uniforms.image, function (img) {
        t.setImage(img);
    });
    delete material.uniforms.image;
    return t;
}
