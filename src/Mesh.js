'use strict';

/**
 * Module dependencies
 */
var Transitionable = require('famous-transitions').Transitionable;
var Color = require('famous-utilities').Color;
var Geometry = require('famous-webgl-geometries');

/**
 * The Mesh class is responsible for providing the API for how
 * a RenderNode will interact with the WebGL API by adding
 * a set of commands to the renderer.
 *
 * @class Mesh
 * @constructor
 * @param {RenderNode} RenderNode to which the instance of Mesh will be a component of
 */
function Mesh (dispatch, options) {
    this.dispatch = dispatch;
    this.queue = [];
    this._id = dispatch.addRenderable(this);

    // Inputs

    this._color = new Color();
    this._glossiness = new Transitionable(0);
    this._positionOffset = new Transitionable([0, 0, 0]);
    this._metallness = new Transitionable(0);
    this._normals = new Transitionable([0, 0, 0]);

    this._origin = new Float32Array([0, 0, 0]);
    this._size = [];
    this._expressions = {};
    this._geometry;

    init.call(this);

    if (options) this.setOptions(options);
}


Mesh.toString = function toString () {
    return 'Mesh';
};


function init() {
    var dispatch = this.dispatch;
    dispatch.onTransformChange(this._receiveTransformChange.bind(this));
    dispatch.onSizeChange(this._receiveSizeChange.bind(this));
    dispatch.onOpacityChange(this._receiveOpacityChange.bind(this));
    dispatch.onOriginChange(this._receiveOriginChange.bind(this));
    this._receiveTransformChange(dispatch.getContext()._transform);
    this._receiveOriginChange(dispatch.getContext()._origin);
    return this;
};


Mesh.prototype._receiveTransformChange = function _receiveTransformChange(transform) {
    this.dispatch.dirtyRenderable(this._id);
    this.queue.push('GL_UNIFORMS');
    this.queue.push('transform');
    this.queue.push(transform._matrix);
};


Mesh.prototype._receiveSizeChange = function _receiveSizeChange(size) {
    var size = size.getTopDownSize();
    this.dispatch.dirtyRenderable(this._id);

    this._size[0] = size[0];
    this._size[1] = size[1];
    this._size[2] = size[2];

    this.queue.push('GL_UNIFORMS');
    this.queue.push('size');
    this.queue.push(size);
};


Mesh.prototype._receiveOriginChange = function _receiveOriginChange(origin) {
    this.dispatch.dirtyRenderable(this._id);
    this.queue.push('GL_UNIFORMS');
    this.queue.push('origin');
    this._origin[0] = origin.x;
    this._origin[1] = origin.y;
    this._origin[2] = origin.z;
    this.queue.push(this._origin);
};


Mesh.prototype._receiveOpacityChange = function _receiveOpacityChange(opacity) {
    this.dispatch.dirtyRenderable(this._id);
    this.queue.push('GL_UNIFORMS');
    this.queue.push('opacity');
    this.queue.push(opacity.value);
};


Mesh.prototype.getSize = function getSize() {
    return this._size;
};

/**
 * Set the geometry of a mesh
 *
 * @method setGeometry
 * @chainable
 *
 * @param {Geometry} geometry instance to be associated with the mesh
 */
Mesh.prototype.setGeometry = function (geometry, options) {
    var i;
    var key;
    var buffers;
    var bufferIndex;

    if (typeof geometry === 'string') {
        if (!Geometry[geometry]) throw 'Invalid geometry: "' + geometry + '".';
        else geometry = new Geometry[geometry](options);
    }

    if (this._geometry !== geometry) {
        this.queue.push('GL_SET_GEOMETRY');
        this.queue.push(geometry.id);
        this.queue.push(geometry.spec.type);
        this.queue.push(geometry.spec.dynamic);

        this._geometry = geometry;
    }

    return this;
};


Mesh.prototype.getGeometry = function () {
    return this._geometry;
};

/**
 * Empties the command queue
 *
 * @method clean
 * @chainable
 *
 */
Mesh.prototype.clean = function clean() {
    var path = this.dispatch.getRenderPath();

    this.dispatch
        .sendDrawCommand('WITH')
        .sendDrawCommand(path);

    var bufferIndex;
    if (this._geometry) {
        i = this._geometry.spec.invalidations.length;
        while (i--) {
            bufferIndex = this._geometry.spec.invalidations.pop();
            this.dispatch.sendDrawCommand('GL_BUFFER_DATA');
            this.dispatch.sendDrawCommand(this._geometry.id);
            this.dispatch.sendDrawCommand(this._geometry.spec.bufferNames[i]);
            this.dispatch.sendDrawCommand(this._geometry.spec.bufferValues[i]);
            this.dispatch.sendDrawCommand(this._geometry.spec.bufferSpacings[i]);
        }
    }

    var baseColor = this._expressions.baseColor;
    var uniformKey;
    if (baseColor) {
        i = baseColor.invalidations.length;
        while (i--) {
            uniformKey = baseColor.invalidations.pop();
            this.dispatch.sendDrawCommand('GL_UNIFORMS');
            this.dispatch.sendDrawCommand(uniformKey);
            this.dispatch.sendDrawCommand(baseColor.uniforms[uniformKey]);
        }
    }

    var positionOffset = this._expressions.positionOffset;
    if (positionOffset) {
        i = positionOffset.invalidations.length;
        while (i--) {
            uniformKey = positionOffset.invalidations.pop();
            this.dispatch.sendDrawCommand('GL_UNIFORMS');
            this.dispatch.sendDrawCommand(uniformKey);
            this.dispatch.sendDrawCommand(positionOffset.uniforms[uniformKey]);
        }
    }

    var i = this.queue.length;
    while (i--) this.dispatch.sendDrawCommand(this.queue.shift());

    if (this._color.isActive()) {
        this.dispatch.sendDrawCommand('GL_UNIFORMS');
        this.dispatch.sendDrawCommand('baseColor');
        this.dispatch.sendDrawCommand(this._color.getNormalizedRGB());
        return true;
    }

    if (this._glossiness.isActive()) {
        this.dispatch.sendDrawCommand('GL_UNIFORMS');
        this.dispatch.sendDrawCommand('glossiness');
        this.dispatch.sendDrawCommand(this._glossiness.get());
        return true;
    }

    return this.queue.length;
};


/**
 * Defines a 3-element map that provides the overall color of the mesh.
 *
 * @method setBaseColor
 * @chainable
 *
 * @param {Object, Array} Material, image, or vec3
 * @return {Element} current Mesh
 */
Mesh.prototype.setBaseColor = function setBaseColor() {
    this.dispatch.dirtyRenderable(this._id);
    var materialExpression = Array.prototype.concat.apply([], arguments);

    if (materialExpression[0]._compile) {
        this.queue.push('MATERIAL_INPUT');
        this._expressions.baseColor = materialExpression[0];
        materialExpression = materialExpression[0]._compile();
    }
    else {
        this.queue.push('GL_UNIFORMS');
        if (this._expressions.baseColor) this._expressions.baseColor = null;
        if (materialExpression[0] instanceof Color) {
            this._color = materialExpression[0];
        }
        else {
            this._color.set(materialExpression);
        }
        materialExpression = this._color.getNormalizedRGB();
    }
    this.queue.push('baseColor');
    this.queue.push(materialExpression);
    return this;
};

Mesh.prototype.getBaseColor = function getBaseColor(option) {
    return this._expressions.baseColor || this._color.getColor(option);
};

/**
 * Defines a 3-element map which is used to provide significant physical detail to
 * the surface by perturbing the facing direction of each individual pixel.
 *
 * @method normal
 * @chainable
 *
 * @param {Object, Array} Material, Image or vec3
 * @return {Element} current Mesh
 */
Mesh.prototype.setNormals = function (materialExpression) {
    this.dispatch.dirtyRenderable(this._id);
    if (materialExpression._compile) materialExpression = materialExpression._compile();
    this.queue.push(typeof materialExpression === 'number' ? 'UNIFORM_INPUT' : 'MATERIAL_INPUT');
    this.queue.push('normal');
    this.queue.push(materialExpression);
    return this;
};

Mesh.prototype.getNormals = function (materialExpression) {
    return;
};

/**
 * Defines 1 element map which is used to normalize the specular and diffuseness of a surface.
 *
 * @method glossiness
 * @chainable
 *
 * @param {Object} Material or Image
 * @return {Element} current Mesh
 */
Mesh.prototype.setGlossiness = function(materialExpression) {
    this.dispatch.dirtyRenderable(this._id);
    var materialExpression = Array.prototype.concat.apply([], arguments);

    if (materialExpression[0]._compile) {
        this.queue.push('MATERIAL_INPUT');
        this._expressions.glossiness = materialExpression[0];
        materialExpression = materialExpression[0]._compile();
    }
    else {
        this._glossiness.set(materialExpression[0], materialExpression[1]);
        this._expressions.glossiness = null;
        this.queue.push('GL_UNIFORMS');
        materialExpression = this._glossiness.get();
    }

    this.queue.push('glossiness');
    this.queue.push(materialExpression);
    return this;
};

Mesh.prototype.getGlossiness = function(materialExpression) {
    return this._expressions.glossiness || this._glossiness.get();
};

/**
 * Defines 1 element map which describes the electrical conductivity of a material.
 *
 * @method metallic
 * @chainable
 *
 * @param {Object} Material or Image
 * @return {Element} current Mesh
 */
Mesh.prototype.setMetallness = function setMetallness(materialExpression) {
    this.dispatch.dirtyRenderable(this._id);
    if (materialExpression._compile) materialExpression = materialExpression._compile();
    this.queue.push(typeof materialExpression === 'number' ? 'UNIFORM_INPUT' : 'MATERIAL_INPUT');
    this.queue.push('metallic');
    this.queue.push(materialExpression);
    return this;
};

Mesh.prototype.getMetallness = function getMetallness() {
    return this._expressions.metallness || this._metallness.get();
};

/**
 * Defines 3 element map which displaces the position of each vertex in world space.
 *
 * @method metallic
 * @chainable
 *
 * @param {Object} Material or Image
 * @return {Element} current Mesh
 */
Mesh.prototype.setPositionOffset = function positionOffset(materialExpression) {
    this.dispatch.dirtyRenderable(this._id);
    var materialExpression = Array.prototype.concat.apply([], arguments);

    if (materialExpression[0]._compile) {
        this.queue.push('MATERIAL_INPUT');
        this._expressions.positionOffset = materialExpression[0];
        materialExpression = materialExpression[0]._compile();
    }
    else {
        this._positionOffset.set(materialExpression[0], materialExpression[1]);
        this._expressions.positionOffset = null;
        this.queue.push('GL_UNIFORMS');
        materialExpression = this._positionOffset.get();
    }

    this.queue.push('positionOffset');
    this.queue.push(materialExpression);
    return this;
};

Mesh.prototype.getPositionOffset = function getPositionOffset(materialExpression) {
    return this._expressions.positionOffset || this._positionOffset.get();
};
/**
 * Defines 3 element map which displaces the position of each vertex in world space.
 *
 * @method metallic
 * @chainable
 *
 * @param {Object} Material or Image
 * @return {Element} current Mesh
 */
Mesh.prototype.setOptions = function setOptions(options) {
    this.queue.push('GL_SET_DRAW_OPTIONS');
    this.queue.push(options);
    return this;
};


/**
 * Expose
 */
module.exports = Mesh;
