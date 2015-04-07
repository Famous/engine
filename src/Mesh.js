'use strict';

var Transitionable = require('famous-transitions').Transitionable;
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

    this._glossiness = new Transitionable(0);
    this._positionOffset = new Transitionable([0, 0, 0]);

    this._size = [];
    this._expressions = {};
    this._flatShading = false;
    this._geometry;
    this._color;

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
 * Pass custom options to Mesh, such as a 3 element map
 * which displaces the position of each vertex in world space.
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
* Pushes invalidations commands, if any exist
*
* @private
* @method _pushInvalidations
*/
Mesh.prototype._pushInvalidations = function _pushInvalidations(expressionName) {
    var uniformKey;
    var expression = this._expressions[expressionName];
    if (expression) {
        var i = expression.invalidations.length;
        while (i--) {
            uniformKey = expression.invalidations.pop();
            this.dispatch.sendDrawCommand('GL_UNIFORMS');
            this.dispatch.sendDrawCommand(uniformKey);
            this.dispatch.sendDrawCommand(expression.uniforms[uniformKey]);
        }
    }
};

/**
* Pushes active commands for any values that are in transition (active) state
*
* @private
* @method _pushActiveCommands
*/
Mesh.prototype._pushActiveCommands = function _pushActiveCommands(property, command, value) {
    if (this[property] && this[property].isActive()) {
        this.dispatch.sendDrawCommand('GL_UNIFORMS');
        this.dispatch.sendDrawCommand(command);
        this.dispatch.sendDrawCommand(this[property][value || 'get']());
        return true;
    }
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
    var bufferIndex;
    var i;

    this.dispatch
        .sendDrawCommand('WITH')
        .sendDrawCommand(path)
        .sendDrawCommand('WEBGL');

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

    // If any invalidations exist, push them into the queue
    this._pushInvalidations('baseColor');
    this._pushInvalidations('positionOffset');

    // If any values are active, push them into the queue
    this._pushActiveCommands('_color', 'baseColor', 'getNormalizedRGB');
    this._pushActiveCommands('_glossiness', 'glossiness');
    this._pushActiveCommands('_positionOffset', 'positionOffset');

    i = this.queue.length;
    while (i--) {
        this.dispatch.sendDrawCommand(this.queue.shift());
    }

    return this.queue.length;
};

/**
* Changes the color of Mesh, passing either a material expression or
* color using the 'Color' utility component.
*
* @method setBaseColor
* @param {Object|Color} Material, image, vec3, or Color instance
* @chainable
*/
Mesh.prototype.setBaseColor = function setBaseColor(color) {
    this.dispatch.dirtyRenderable(this._id);

    // If a material expression
    if (color._compile) {
        this.queue.push('MATERIAL_INPUT');
        this._expressions.baseColor = color;
        color = color._compile();
    }
    // If a color component
    else if (color.getNormalizedRGB) {
        this.queue.push('GL_UNIFORMS');
        this._expressions.baseColor = null;
        this._color = color;
        color = color.getNormalizedRGB();
    }

    this.queue.push('baseColor');
    this.queue.push(color);
    return this;
};


/**
 * Returns either the material expression or the color instance of Mesh.
 *
 * @method getBaseColor
 * @returns {MaterialExpress|Color}
 */
Mesh.prototype.getBaseColor = function getBaseColor() {
    return this._expressions.baseColor || this._color;
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
    this._flatShading = bool;
    this.queue.push('GL_UNIFORMS');
    this.queue.push('u_FlatShading');
    this.queue.push(this._flatShading ? 1 : 0);
    return this;
};

/**
 * Returns a boolean for whether Mesh is affected by light.
 *
 * @method getFlatShading
 * @returns {Boolean} Boolean
 */
Mesh.prototype.getFlatShading = function getFlatShading() {
    return this._flatShading;
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
    if (materialExpression._compile) {
        this._expressions.normals = materialExpression;
        materialExpression = materialExpression._compile();
    }
    this.queue.push(typeof materialExpression === 'number' ? 'UNIFORM_INPUT' : 'MATERIAL_INPUT');
    this.queue.push('normal');
    this.queue.push(materialExpression);
    return this;
};

/**
 * Returns the Normals expression of Mesh
 *
 * @method getNormals
 * @returns The normals expression for Mesh
 */
Mesh.prototype.getNormals = function getNormals(materialExpression) {
    return this._expressions.normals;
};

/**
 * Defines the glossiness of the mesh from either a material expression or a
 * scalar value
 *
 * @method setGlossiness
 * @param {MaterialExpression|Number}
 * @param {Object} Optional tweening parameter
 * @param {Function} Callback
 * @chainable
 */
Mesh.prototype.setGlossiness = function setGlossiness(materialExpression, transition, cb) {
    this.dispatch.dirtyRenderable(this._id);

    if (materialExpression._compile) {
        this.queue.push('MATERIAL_INPUT');
        this._expressions.glossiness = materialExpression;
        materialExpression = materialExpression._compile();
    }
    else {
        this.queue.push('GL_UNIFORMS');
        this._expressions.glossiness = null;
        this._glossiness.set(materialExpression, transition, cb);
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
Mesh.prototype.getGlossiness = function getGlossiness() {
    return this._expressions.glossiness || this._glossiness.get();
};

/**
 * Defines 3 element map which displaces the position of each vertex in world
 * space.
 *
 * @method setPositionOffset
 * @chainable
 *
 * @param {MaterialExpression|Array}
 * @param {Object} Optional tweening parameter
 * @param {Function} Callback
 * @chainable
 */
Mesh.prototype.setPositionOffset = function positionOffset(materialExpression, transition, cb) {
    this.dispatch.dirtyRenderable(this._id);

    if (materialExpression._compile) {
        this.queue.push('MATERIAL_INPUT');
        this._expressions.positionOffset = materialExpression;
        materialExpression = materialExpression._compile();
    }
    else {
        this.queue.push('GL_UNIFORMS');
        this._expressions.positionOffset = null;
        this._positionOffset.set(materialExpression, transition, cb);
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

module.exports = Mesh;
