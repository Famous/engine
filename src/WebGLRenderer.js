'use strict';

var Texture = require('./Texture');
var Program = require('./Program');
var Buffer = require('./Buffer');
var BufferRegistry = require('./BufferRegistry');
var checkers = require('./Checkerboard');

var identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

/**
 * WebGLRenderer is a private class that manages all interactions with the WebGL
 * API.  Each frame it receives commands from the compositor and updates its registries 
 * accordingly.  Subsequently, the draw function is called and the WebGLRenderer
 * issues draw calls for all meshes in its registry.
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

    var gl = this.gl = this.getWebGLContext(this.canvas);
    var containerSize = this.container._getSize();

    gl.polygonOffset(0.1, 0.1);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.depthFunc(gl.LEQUAL);

    this.meshRegistry = {};
    this.meshRegistryKeys = [];
    this.ambientLight = [0, 0, 0];
    this.lightRegistry = {};
    this.lightRegistryKeys = [];
    this.textureRegistry = [];
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
 * Attempts to retreive the WebGLRenderer context using several
 * accessors.  For browser compatability.  Throws on error.
 *
 * @method getWebGLContext
 *
 * @param {Object} canvas Canvas element from which the context is retreived.
 *
 * @return {Object} WebGLContext of canvas element.
 */
WebGLRenderer.prototype.getWebGLContext = function getWebGLContext(canvas) {
    var names = ['webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl'];
    var context = null;
    for (var i = 0; i < names.length; i++) {
        try {
            context = canvas.getContext(names[i]);
        }
        catch (error) {
            var msg = 'Error creating WebGL context: ' + error.toString();
            console.error(msg);
        }
        if (context) {
            break;
        }
    }
    return context ? context : false;
};

/**
 * Adds a new base spec to the light registry at a given path.
 *
 * @method createLight
 *
 * @param {String} path Path used as id of new light in lightRegistry.
 *
 * @return {Object} Newly create light spec.
 */
WebGLRenderer.prototype.createLight = function createLight(path) {
    this.lightRegistryKeys.push(path);
    return this.lightRegistry[path] = {
        color: [0, 0, 0],
        position: [0, 0, 0]
    };
};

/**
 * Adds a new base spec to the mesh registry at a given path.
 *
 * @method createMesh
 *
 * @param {String} path Path used as id of new mesh in meshRegistry.
 *
 * @return {Object} Newly create mesh spec.
 */
WebGLRenderer.prototype.createMesh = function createMesh(path) {
    this.meshRegistryKeys.push(path);
    return this.meshRegistry[path] = {
        uniformKeys: ['opacity', 'transform', 'size', 'origin', 'baseColor', 'positionOffset', 'u_FlatShading'],
        uniformValues: [1, identity, [0, 0, 0], [0, 0, 0], [0.5, 0.5, 0.5], [0, 0, 0], 0],
        buffers: {},
        geometry: null,
        drawType: null,
        texture: null
    };
};


/**
 * Receives updates to meshes and other famous renderables, and updates
 * registries accordingly.
 *
 * @method receive
 *
 * @param {String} path Path to given famous renderable used as key in registry.
 * @param {Array} commands Array of commands used to update a renderable.
 */
WebGLRenderer.prototype.receive = function receive(path, commands) {
    var bufferName, bufferValue, bufferSpacing, uniformName, uniformValue, geometryId;
    var mesh = this.meshRegistry[path];
    var light = this.lightRegistry[path];

    var command = commands.shift();
    switch (command) {

        case 'GL_SET_DRAW_OPTIONS':
            if (!mesh) mesh = this.createMesh(path);
            mesh.options = commands.shift();
            break;

        case 'GL_AMBIENT_LIGHT':
            this.ambientLight[0] = commands.shift();
            this.ambientLight[1] = commands.shift();
            this.ambientLight[2] = commands.shift();
            break;

        case 'GL_LIGHT_POSITION':
            if (!light) light = this.createLight(path);
            light.position[0] = commands.shift();
            light.position[1] = commands.shift();
            light.position[2] = commands.shift();
            break;

        case 'GL_LIGHT_COLOR':
            if (!light) light = this.createLight(path);
            light.color[0] = commands.shift();
            light.color[1] = commands.shift();
            light.color[2] = commands.shift();
            break;

        case 'MATERIAL_INPUT':
            if (!mesh) mesh = this.createMesh(path);
            var name = commands.shift();
            var mat = commands.shift();
            mesh.uniformValues[name === 'baseColor' ? 4 : 5][0] = -mat._id;
            if (mat.texture) mesh.texture = handleTexture.call(this, mat.texture);
            this.program.registerMaterial(name, mat);
            this.updateSize();
            break;

        case 'GL_SET_GEOMETRY':
            if (!mesh) mesh = this.createMesh(path);
            mesh.geometry = commands.shift();
            mesh.drawType = commands.shift();
            mesh.dynamic = commands.shift();
            break;

        case 'GL_UNIFORMS':
            if (!mesh) mesh = this.createMesh(path);
            uniformName = commands.shift();
            uniformValue = commands.shift();
            var index = mesh.uniformKeys.indexOf(uniformName);
            if (index === -1) {
                mesh.uniformKeys.push(uniformName);
                mesh.uniformValues.push(uniformValue);
            }
            else {
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
};

/**
 * Triggers the 'draw' phase of the WebGLRenderer.  Iterates through registries
 * to set uniforms, set attributes and issue draw commands for renderables.
 *
 * @method draw
 *
 * @param {Object} renderState Parameters provided by the compositor, that
 * affect the rendering of all renderables.
 */
WebGLRenderer.prototype.draw = function draw(renderState) {
    var mesh;
    var buffers;
    var size;
    var light;
    var i;
    var len;

    /**
     * Light updates
     */
    this.program.setUniforms(['u_AmbientLight'], [this.ambientLight]);
    for (i = 0, len = this.lightRegistryKeys.length; i < len; i++) {
        light = this.lightRegistry[this.lightRegistryKeys[i]];
        this.program.setUniforms(['u_LightPosition'], [light.position]);
        this.program.setUniforms(['u_LightColor'], [light.color]);
    }

    this.projectionTransform[11] = renderState.perspectiveTransform[11];

    this.program.setUniforms(['perspective', 'time', 'view'], [this.projectionTransform, Date.now()  % 100000 / 1000, renderState.viewTransform]);

    for (i = 0, len = this.meshRegistryKeys.length; i < len; i++) {
        mesh = this.meshRegistry[this.meshRegistryKeys[i]];
        buffers = this.bufferRegistry.registry[mesh.geometry];

        if (!buffers) continue;

        if (mesh.options) this.handleOptions(mesh.options);
        if (mesh.texture) mesh.texture.bind();

        this.program.setUniforms(mesh.uniformKeys, mesh.uniformValues);
        this.drawBuffers(buffers, mesh.drawType, mesh.geometry);

        if (mesh.texture) mesh.texture.unbind();
        if (mesh.options) this.resetOptions(mesh.options);
    }
};


/**
 * Loads the buffers and issues the draw command for a geometry.
 *
 * @method drawBuffers
 *
 * @param {Object} vertexBuffers All buffers used to draw the geometry.
 * @param {Number} mode Enumerator defining what primitive to draw
 * @param {Number} id ID of geometry being drawn.
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
 * @param {Function} callback The render function to be called after setup and before cleanup.
 * @param {Array} size Size of framebuffer being drawn to.
 * @param {Object} texture Location where the render data is stored.
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
 * Diagnoses the failed intialization of an FBO.
 *
 * @method checkFrameBufferStatus
 *
 * @param {Object} the WebGLContext that owns this FBO.
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
 * Size is retreived from the container object of the renderer.
 *
 * @method updateSize
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

/**
 * Updates the state of the WebGL drawing context based on custom parameters
 * defined on a mesh.
 *
 * @method handleOptions
 * 
 * @param {Object} options Draw state options to be set to the context.
 */
WebGLRenderer.prototype.handleOptions = function handleOptions(options) {
    var gl = this.gl;
    if (!options) return;
    if (options.blending) gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
};

/**
 * Resets the state of the WebGL drawing context to default values.
 *
 * @method resetOptions
 * 
 * @param {Object} options Draw state options to be set to the context.
 */
WebGLRenderer.prototype.resetOptions = function resetOptions(options) {
    var gl = this.gl;
    if (!options) return;
    if (options.blending) gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
};

/**
 * Loads an image from a string or Image object and executes a callback function.
 *
 * @method loadImage
 * @private
 *
 * @param {Object | String} img The input image data to load as an asset.
 * @param {Function} callback The callback function to be fired when
 * the image has finished loading.
 *
 * @return {Object} Image object being loaded.
 */
function loadImage (img, callback) {
    var obj = (typeof img === 'string' ? new Image() : img) || {};
    obj.crossOrigin = 'anonymous';
    if (! obj.src) obj.src = img;
    if (! obj.complete) obj.onload = function () { callback(obj); };
    else callback(obj);
    return obj;
}

/**
 * Handles loading of texture objects.
 *
 * @method handleTexture
 * @private
 *
 * @param {Object} input The input texture object collected from mesh.
 *
 * @return {Object} Texture instance linked to input data.
 */
function handleTexture(input) {
    var source = input.data;
    var textureId = input.id;
    var options = input.options;
    var texture = this.textureRegistry[textureId];

    if (!texture) {
        if (Array.isArray(source)) {
            texture = new Texture(this.gl, options);
            texture.setArray(source);
        }

        else if (window && source instanceof window.HTMLVideoElement) {
            texture = new Texture(this.gl, options);
            texture.src = texture;
            texture.setImage(checkers);
            source.addEventListener('loadeddata', function(x) {
                texture.setImage(source);
                setInterval(function () { texture.setImage(source); }, 16);
            });
        }

        else if ('string' === typeof source) {
            texture = new Texture(this.gl, options);
            texture.setImage(checkers);
            loadImage(source, function (img) {
                texture.setImage(img);
            });
        }

        this.textureRegistry[textureId] = texture;
    }

    return texture;
}

module.exports = WebGLRenderer;
