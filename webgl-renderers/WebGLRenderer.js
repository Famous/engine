'use strict';

var Texture = require('./Texture');
var Program = require('./Program');
var Buffer = require('./Buffer');
var BufferRegistry = require('./BufferRegistry');
var Plane = require('../webgl-geometries').Plane;
var sorter = require('./radixSort');
var Utility = require('../utilities');
var TextureManager = require('./TextureManager');
var compileMaterial = require('./compileMaterial');

var identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

var globalUniforms = Utility.keyValueToArrays({
    'u_NumLights': 0,
    'u_AmbientLight': new Array(3),
    'u_LightPosition': new Array(3),
    'u_LightColor': new Array(3),
    'perspective': new Array(16),
    'time': 0,
    'view': new Array(16)
});

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
function WebGLRenderer(canvas) {
    this.canvas = canvas;

    var gl = this.gl = this.getWebGLContext(this.canvas);

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.polygonOffset(0.1, 0.1);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.depthFunc(gl.LEQUAL);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    this.meshRegistry = {};
    this.meshRegistryKeys = [];

    this.cutoutRegistry = {};
    
    this.cutoutRegistryKeys = [];

    /**
     * Lights
     */
    this.numLights = 0;
    this.ambientLightColor = [0, 0, 0];
    this.lightRegistry = {};
    this.lightRegistryKeys = [];
    this.lightPositions = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.lightColors = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    this.textureManager = new TextureManager(gl);
    this.texCache = {};
    this.bufferRegistry = new BufferRegistry(gl);
    this.program = new Program(gl, { debug: true });

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

    /*
    The projectionTransform has some constant components, i.e. the z scale, and the x and y translation.

    The z scale keeps the final z position of any vertex within the clip's domain by scaling it by an
    arbitrarily small coefficient. This has the advantage of being a useful default in the event of the
    user forgoing a near and far plane, an alien convention in dom space as in DOM overlapping is
    conducted via painter's algorithm.

    The x and y translation transforms the world space origin to the top left corner of the screen.

    The final component (this.projectionTransform[15]) is initialized as 1 because certain projection models,
    e.g. the WC3 specified model, keep the XY plane as the projection hyperplane.
    */
    
    this.projectionTransform = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -0.000001, 0, -1, 1, 0, 1];

    var cutout = this.cutoutGeometry = new Plane();
    this.bufferRegistry.allocate(cutout.id, 'pos', cutout.spec.bufferValues[0], 3);
    this.bufferRegistry.allocate(cutout.id, 'texCoord', cutout.spec.bufferValues[1], 2);
    this.bufferRegistry.allocate(cutout.id, 'normals', cutout.spec.bufferValues[2], 3);
    this.bufferRegistry.allocate(cutout.id, 'indices', cutout.spec.bufferValues[3], 1);
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
 * @param {String} Path used as id of new light in lightRegistry.
 *
 * @return {Object} Newly created light spec.
 */
WebGLRenderer.prototype.createLight = function createLight(path) {
    this.numLights++;
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
 * @param {String} Path used as id of new mesh in meshRegistry.
 *
 * @return {Object} Newly created mesh spec.
 */
WebGLRenderer.prototype.createMesh = function createMesh(path) {
    this.meshRegistryKeys.push(path);
    var uniforms = Utility.keyValueToArrays({
        opacity: 1,
        transform: identity,
        size: [0, 0, 0],
        baseColor: [0.5, 0.5, 0.5, 1],
        positionOffset: [0, 0, 0],
        u_Normals: [0, 0, 0],
        u_FlatShading: 0,
        glossiness: [0, 0, 0, 0]
    });
    return this.meshRegistry[path] = {
        depth: null,
        uniformKeys: uniforms.keys,
        uniformValues: uniforms.values,
        buffers: {},
        geometry: null,
        drawType: null,
        textures: [],
        visible: true
    };
};


/**
 * Creates or retreives cutout
 *
 * @method getOrSetCutout
 *
 * @param {String} Path used as id of new mesh in meshRegistry.
 *
 * @return {Object} Newly created cutout spec.
 */

WebGLRenderer.prototype.getOrSetCutout = function getOrSetCutout(path) {
    var geometry;

    if (this.cutoutRegistry[path]) {
        return this.cutoutRegistry[path];
    }
    else {
        var uniforms = Utility.keyValueToArrays({
            opacity: 0,
            transform: identity,
            size: [0, 0, 0],
            origin: [0, 0, 0],
            baseColor: [0, 0, 0, 1]
        });

        return this.cutoutRegistry[path] = {
            uniformKeys: uniforms.keys,
            uniformValues: uniforms.values,
            geometry: this.cutoutGeometry.id,
            drawType: 4
        };
    }
};

/**
 * Prevents a mesh from being drawn to the canvas.
 *
 * @method hideMesh
 *
 * @param {String} path Path used as id of mesh in mesh registry.
 *
 */
WebGLRenderer.prototype.hideMesh = function hideMesh(path) {
    var mesh = this.meshRegistry[path] || this.createMesh(path);
    mesh.visible = false;
};

/**
 * Allows a mesh to be drawn to the canvas.
 *
 * @method showMesh
 *
 * @param {String} path Path used as id of mesh in mesh registry.
 *
 */
WebGLRenderer.prototype.showMesh = function showMesh(path) {
    var mesh = this.meshRegistry[path] || this.createMesh(path);
    mesh.visible = true;
};

WebGLRenderer.prototype.removeMesh = function removeMesh(path) {
    var keyLocation = this.meshRegistryKeys.indexOf(path);
    this.meshRegistryKeys.splice(keyLocation, 1);

    var len = this.meshRegistryKeys.length;
    var targetGeometry = this.meshRegistry[path].geometry;
    var key;

    this.meshRegistry[path] = null;

    for (var i = 0; i < len; i++) {
        key = this.meshRegistryKeys[i];

        // If geometry is being used in another mesh return

        if (this.meshRegistry[key].geometry === targetGeometry) {
            return;
        }
    }

    // Deallocate WebGL buffers for geometry if no longer necessary

    this.bufferRegistry.deallocate(targetGeometry);
};


/**
 * Creates or retreives cutout
 *
 * @method setCutoutUniform
 *
 * @param {String} Path used as id of cutout in cutout registry.
 * @param {String} uniformLocation identifier used to upload value
 * @param {Array} value of uniform data
 *
 */

WebGLRenderer.prototype.setCutoutUniform = function setCutoutUniform(path, uniformName, uniformValue) {
    var cutout = this.getOrSetCutout(path);

    var index = cutout.uniformKeys.indexOf(uniformName);

    cutout.uniformValues[index] = uniformValue;
};


/**
 * Edits the options field on a mesh
 *
 * @method setMeshOptions
 *
 * @param {String} Path used as id of cutout in cutout registry.
 * @param {Object} map of draw options for mesh
 *
**/
WebGLRenderer.prototype.setMeshOptions = function(path, options) {
    var mesh = this.meshRegistry[path] || this.createMesh(path);

    mesh.options = options;
    return this;
};


/**
 * Changes the color of the fixed intensity lighting in the scene
 *
 * @method setAmbientLightColor
 *
 * @param {String} path used as id of light
 * @param {Number} red channel
 * @param {Number} green channel
 * @param {Number} blue channel
 *
**/
WebGLRenderer.prototype.setAmbientLightColor = function setAmbientLightColor(path, r, g, b) {
    this.ambientLightColor[0] = r;
    this.ambientLightColor[1] = g;
    this.ambientLightColor[2] = b;
    return this;
};


/**
 * Changes the location of the light in the scene
 *
 * @method setLightPosition
 *
 * @param {String} path used as id of light
 * @param {Number} x position
 * @param {Number} y position
 * @param {Number} z position
 *
**/
WebGLRenderer.prototype.setLightPosition = function setLightPosition(path, x, y, z) {
    var light = this.lightRegistry[path] || this.createLight(path);

    light.position[0] = x;
    light.position[1] = y;
    light.position[2] = z;
    return this;
};


/**
 * Changes the color of a dynamic intensity lighting in the scene
 *
 * @method setLightColor
 *
 * @param {String} path used as id of light in light Registry.
 * @param {Number} red channel
 * @param {Number} green channel
 * @param {Number} blue channel
 *
**/
WebGLRenderer.prototype.setLightColor = function setLightColor(path, r, g, b) {
    var light = this.lightRegistry[path] || this.createLight(path);

    light.color[0] = r;
    light.color[1] = g;
    light.color[2] = b;
    return this;
};
/**
 * Compiles material spec into program shader
 *
 * @method handleMateriaInput
 *
 * @param {String} Path used as id of cutout in cutout registry.
 * @param {String} which rendering input the material is bound to
 * @param {Object} material spec
 *
**/
WebGLRenderer.prototype.handleMaterialInput = function handleMaterialInput(path, name, material) {
    var mesh = this.meshRegistry[path] || this.createMesh(path);
    var material = compileMaterial(material, mesh.textures.length);

    // Set uniforms to enable texture!

    mesh.uniformValues[mesh.uniformKeys.indexOf(name)][0] = -material._id;

    // Register textures!

    var i = material.textures.length;
    while (i--) {
        mesh.textures.push(
            this.textureManager.register(material.textures[i], mesh.textures.length + i)
        );
    }

    // Register material!

    this.program.registerMaterial(name, material);

    return this.updateSize();
};

/**
 * Changes the geometry data of a mesh
 *
 * @method setGeometry
 *
 * @param {String} Path used as id of cutout in cutout registry.
 * @param {Object} Geometry object containing vertex data to be drawn
 * @param {Number} primitive identifier
 * @param {Boolean} will the geometry data change?
 *
**/

WebGLRenderer.prototype.setGeometry = function setGeometry(path, geometry, drawType, dynamic) {
    var mesh = this.meshRegistry[path] || this.createMesh(path);

    mesh.geometry = geometry;
    mesh.drawType = drawType;
    mesh.dynamic = dynamic;

    return this;
};

/**
 * Uploads a new value for the uniform data when the mesh is being drawn
 *
 * @method setMeshUniform
 *
 * @param {String} Path used as id of mesh in mesh registry
 * @param {String} uniformLocation identifier used to upload value
 * @param {Array} value of uniform data
 *
**/
WebGLRenderer.prototype.setMeshUniform = function setMeshUniform(path, uniformName, uniformValue) {
    var mesh = this.meshRegistry[path] || this.createMesh(path);

    var index = mesh.uniformKeys.indexOf(uniformName);
    if (index === -1) {
        mesh.uniformKeys.push(uniformName);
        mesh.uniformValues.push(uniformValue);
    }
    else {
        mesh.uniformValues[index] = uniformValue;
    }
};

/**
 * Triggers the 'draw' phase of the WebGLRenderer.  Iterates through registries
 * to set uniforms, set attributes and issue draw commands for renderables.
 *
 * @method bufferData
 *
 * @param {String} Path used as id of mesh in mesh registry
 * @param {Number} Id of geometry in geometry registry
 * @param {String} Attribute location name
 * @param {Array} Vertex data
 * @param {Number} The dimensions of the vertex
 */


WebGLRenderer.prototype.bufferData = function bufferData(path, geometryId, bufferName, bufferValue, bufferSpacing, isDynamic) {
    this.bufferRegistry.allocate(geometryId, bufferName, bufferValue, bufferSpacing, isDynamic);

    return this;
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
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.textureManager.update();
    
    this.setGlobalUniforms(renderState);
    this.meshRegistryKeys = sorter(this.meshRegistryKeys, this.meshRegistry);
    this.drawCutouts();
    this.drawMeshes();
};

WebGLRenderer.prototype.drawMeshes = function drawMeshes() {
    var gl = this.gl;
    var buffers;
    var mesh;

    for(var i = 0; i < this.meshRegistryKeys.length; i++) {
        mesh = this.meshRegistry[this.meshRegistryKeys[i]];
        buffers = this.bufferRegistry.registry[mesh.geometry];

        if (!mesh.visible) continue;

        if (mesh.uniformValues[0] < 1) {
            gl.depthMask(false);
            gl.enable(gl.BLEND);
        } else {
            gl.depthMask(true);
            gl.disable(gl.BLEND);
        }

        if (!buffers) continue;

        var j = mesh.textures.length;
        while (j--) this.textureManager.bindTexture(mesh.textures[j]);
        
        if (mesh.options) this.handleOptions(mesh.options, mesh);
        
        this.program.setUniforms(mesh.uniformKeys, mesh.uniformValues);
        this.drawBuffers(buffers, mesh.drawType, mesh.geometry);

        if (mesh.options) this.resetOptions(mesh.options);
    }
};

WebGLRenderer.prototype.drawCutouts = function drawCutouts() {
    var cutout;
    var buffers;
    var len = this.cutoutRegistryKeys.length;

    if (len) this.gl.enable(this.gl.BLEND);

    for (var i = 0; i < len; i++) {
        cutout = this.cutoutRegistry[this.cutoutRegistryKeys[i]];
        buffers = this.bufferRegistry.registry[cutout.geometry];

        this.program.setUniforms(cutout.uniformKeys, cutout.uniformValues);
        this.drawBuffers(buffers, cutout.drawType, cutout.geometry);
    }

    if (len) this.gl.disable(this.gl.BLEND);
};

WebGLRenderer.prototype.setGlobalUniforms = function setGlobalUniforms(renderState) {
    var light;
    var stride;

    for (var i = 0, len = this.lightRegistryKeys.length; i < len; i++) {
        light = this.lightRegistry[this.lightRegistryKeys[i]];
        stride = i * 4;

        // Build the light positions' 4x4 matrix

        this.lightPositions[0 + stride] = light.position[0];
        this.lightPositions[1 + stride] = light.position[1];
        this.lightPositions[2 + stride] = light.position[2];

        // Build the light colors' 4x4 matrix

        this.lightColors[0 + stride] = light.color[0];
        this.lightColors[1 + stride] = light.color[1];
        this.lightColors[2 + stride] = light.color[2];
    }

    globalUniforms.values[0] = this.numLights;
    globalUniforms.values[1] = this.ambientLightColor;
    globalUniforms.values[2] = this.lightPositions;
    globalUniforms.values[3] = this.lightColors;

    /*
     * Set time and projection uniforms
     * projecting world space into a 2d plane representation of the canvas.
     * The x and y scale (this.projectionTransform[0] and this.projectionTransform[5] respectively)
     * convert the projected geometry back into clipspace.
     * The perpective divide (this.projectionTransform[11]), adds the z value of the point
     * multiplied by the perspective divide to the w value of the point. In the process
     * of converting from homogenous coordinates to NDC (normalized device coordinates)
     * the x and y values of the point are divided by w, which implements perspective.
     */

    this.projectionTransform[0] = 1 / (this.cachedSize[0] * 0.5);
    this.projectionTransform[5] = -1 / (this.cachedSize[1] * 0.5);
    this.projectionTransform[11] = renderState.perspectiveTransform[11];

    globalUniforms.values[4] = this.projectionTransform;
    globalUniforms.values[5] = Date.now() % 100000 / 1000;
    globalUniforms.values[6] = renderState.viewTransform;

    this.program.setUniforms(globalUniforms.keys, globalUniforms.values);
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
 * Wraps draw methods in bound frame buffer
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
 *
 * @param {Array} width, height and depth of canvas
 *
 */
WebGLRenderer.prototype.updateSize = function updateSize(size) {
    if (size) {
        this.cachedSize[0] = size[0];
        this.cachedSize[1] = size[1];
        this.cachedSize[2] = (size[0] > size[1]) ? size[0] : size[1];
    }

    this.gl.viewport(0, 0, this.cachedSize[0], this.cachedSize[1]);

    this.resolutionValues[0] = this.cachedSize;
    this.program.setUniforms(this.resolutionName, this.resolutionValues);

    return this;
};

/**
 * Updates the state of the WebGL drawing context based on custom parameters
 * defined on a mesh.
 *
 * @method handleOptions
 *
 * @param {Object} options Draw state options to be set to the context.
 */
WebGLRenderer.prototype.handleOptions = function handleOptions(options, mesh) {
    var gl = this.gl;
    if (!options) return;

    if (options.side == 'double') {
        this.cullFace(this.gl.FRONT);
        this.drawBuffers(this.bufferRegistry.registry[mesh.geometry], mesh.drawType, mesh.geometry);
        this.cullFace(this.gl.BACK);
    }

    if (options.blending) gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    if (options.side === 'back') gl.cullFace(gl.FRONT);
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
    if (options.side === 'back') gl.cullFace(gl.BACK);
};

module.exports = WebGLRenderer;
