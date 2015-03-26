'use strict';

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
 * @renderable
 * @param {LocalDispatch} dispatch LocalDispatch to be retrieved
 * @param {object} Options Optional params for configuring Mesh
 */
function Mesh (dispatch, options) {
    this.dispatch = dispatch;
    this.queue = [];
    this._id = dispatch.addRenderable(this);

    this._color = new Color();
    this._glossiness = new Transitionable(0);
    this._positionOffset = new Transitionable([0, 0, 0]);
    this._metallness = new Transitionable(0);
    this._normals = new Transitionable([0, 0, 0]);

    this._size = [];
    this._expressions = {};
    this._geometry;
    this._flatShading = 0;

    this.dispatch.onTransformChange(this._receiveTransformChange.bind(this));
    this.dispatch.onSizeChange(this._receiveSizeChange.bind(this));
    this.dispatch.onOpacityChange(this._receiveOpacityChange.bind(this));

    this._receiveTransformChange(this.dispatch.getContext()._transform);
    this._receiveSizeChange(this.dispatch.getContext()._size);
    this._receiveOpacityChange(this.dispatch.getContext()._opacity);

    if (options) this.setOptions(options);
}

/**
* Returns the definition of the Class: 'Mesh'
*
* @method toString
* @return {string} definition
*/
Mesh.toString = function toString() {
    return 'Mesh';
};

/**
 * Receives transform change updates from the scene graph.
 *
 * @private
 */
Mesh.prototype._receiveTransformChange = function _receiveTransformChange(transform) {
    this.dispatch.dirtyRenderable(this._id);
    this.queue.push('GL_UNIFORMS');
    this.queue.push('transform');
    this.queue.push(transform._matrix);
};

/**
 * Receives size change updates from the scene graph.
 *
 * @private
 */
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

/**
 * Receives opacity change updates from the scene graph.
 *
 * @private
 */
Mesh.prototype._receiveOpacityChange = function _receiveOpacityChange(opacity) {
    this.dispatch.dirtyRenderable(this._id);
    this.queue.push('GL_UNIFORMS');
    this.queue.push('opacity');
    this.queue.push(opacity.value);
};

/**
 * Returns the size of Mesh.
 *
 * @method getSize
 * @returns {array} Size Returns size
 */
Mesh.prototype.getSize = function getSize() {
    return this._size;
};

/**
 * Set the geometry of a mesh.
 *
 * @method setGeometry
 * @chainable
 *
 * @param {Geometry} geometry instance to be associated with the mesh
 * @param {Object} Options Various configurations for geometries.
 * @chainable
 */
Mesh.prototype.setGeometry = function setGeometry(geometry, options) {
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

/**
 * Get the geometry of a mesh.
 *
 * @method getGeometry
 * @returns {Geometry} geometry Geometry of mesh
 */
Mesh.prototype.getGeometry = function getGeometry() {
    return this._geometry;
};

/**
* Returns boolean: if true, renderable is to be updated on next engine tick
*
* @private
* @method clean
* @returns {boolean} Boolean
*/
Mesh.prototype.clean = function clean() {
    var path = this.dispatch.getRenderPath();

    this.dispatch
        .sendDrawCommand('WITH')
        .sendDrawCommand(path)
        .sendDrawCommand('WEBGL');

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
* Changes the color of Mesh, passing either a material expression or a basic
* color using 'Color' as its helper. If no material expression is passed in,
* then the Color accepts various inputs and an optional options parameter for
* tweening colors. Its default parameters are in RGB, however, you can also
* specify different inputs.
* setBaseColor(r, g, b, option)
* setBaseColor('rgb', 0, 0, 0, option)
* setBaseColor('hsl', 0, 0, 0, option)
* setBaseColor('hsv', 0, 0, 0, option)
* setBaseColor('hex', '#000000', option)
* setBaseColor('#000000', option)
* setBaseColor('black', option)
* setBaseColor(Color)
*
* @method setBaseColor
* @param {Object|Array} Material, image, or vec3
* @param {number} r Used to set the r value of Color
* @param {number} g Used to set the g value of Color
* @param {number} b Used to set the b value of Color
* @param {object} options Optional options argument for tweening colors
* @chainable
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
        if (Color.isColorInstance(materialExpression[0])) {
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


/**
 * Returns either the material expression or the color of Mesh.
 *
 * @method getBaseColor
 * @returns {MaterialExpress|Color}
 */
Mesh.prototype.getBaseColor = function getBaseColor(option) {
    return this._expressions.baseColor || this._color.getColor(option);
};

/**
 * Change whether the Mesh is affected by light. Default is true.
 *
 * @method setFlatShading
 * @param {boolean} Boolean
 * @chainable
 */
Mesh.prototype.setFlatShading = function setFlatShading(bool) {
    this.dispatch.dirtyRenderable(this._id);
    this._flatShading = bool ? 1 : 0;
    this.queue.push('GL_UNIFORMS');
    this.queue.push('u_FlatShading');
    this.queue.push(this._flatShading);
    return this;
};

/**
 * Returns a boolean for whether Mesh is affected by light.
 *
 * @method getFlatShading
 * @returns {boolean} Boolean
 */
Mesh.prototype.getFlatShading = function getFlatShading() {
    return this._flatShading ? true : false;
};


/**
 * Defines a 3-element map which is used to provide significant physical
 * detail to the surface by perturbing the facing direction of each individual
 * pixel.
 *
 * @method normal
 * @chainable
 *
 * @param {Object|Array} Material, Image or vec3
 * @return {Element} current Mesh
 */
Mesh.prototype.setNormals = function setNormals(materialExpression) {
    this.dispatch.dirtyRenderable(this._id);
    if (materialExpression._compile) materialExpression = materialExpression._compile();
    this.queue.push(typeof materialExpression === 'number' ? 'UNIFORM_INPUT' : 'MATERIAL_INPUT');
    this.queue.push('normal');
    this.queue.push(materialExpression);
    return this;
};

/**
 * Returns the Normals expression of Mesh (work in progress)
 *
 * @method getNormals
 * @returns The normals expression for Mesh
 */
Mesh.prototype.getNormals = function getNormals(materialExpression) {
    return null;
};

/**
 * Defines the glossiness of the mesh from either a material expression or a
 * scalar value
 *
 * @method setGlossiness
 * @param {MaterialExpression|Number}
 * @param {Object} Options Optional paramter to be passed with scalar
 * glossiness for tweening.
 * @chainable
 */
Mesh.prototype.setGlossiness = function setGlossiness() {
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

/**
 * Returns material expression or scalar value for glossiness.
 *
 * @method getGlossiness
 * @returns {MaterialExpress|Number}
 */
Mesh.prototype.getGlossiness = function getGlossiness(materialExpression) {
    return this._expressions.glossiness || this._glossiness.get();
};

/**
 * Defines 1 element map which describes the electrical conductivity of a
 * material.
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

/**
 * Returns material expression for metallness.
 *
 * @method getMetallness
 * @returns {MaterialExpress}
 */
Mesh.prototype.getMetallness = function getMetallness() {
    return this._expressions.metallness || this._metallness.get();
};

/**
 * Defines 3 element map which displaces the position of each vertex in world
 * space.
 *
 * @method setPositionOffset
 * @chainable
 *
 * @param {Object} Material Expression
 * @chainable
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

/**
 * Returns position offset.
 *
 * @method getPositionOffset
 * @returns {MaterialExpress|Number}
 */
Mesh.prototype.getPositionOffset = function getPositionOffset(materialExpression) {
    return this._expressions.positionOffset || this._positionOffset.get();
};

/**
 * Defines 3 element map which displaces the position of each vertex in world
 * space.
 *
 * @method setOptions
 * @chainable
 *
 * @param {Object} Options
 * @chainable
 */
Mesh.prototype.setOptions = function setOptions(options) {
    this.queue.push('GL_SET_DRAW_OPTIONS');
    this.queue.push(options);
    return this;
};

module.exports = Mesh;
