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
var Geometry = require('../webgl-geometries');

/**
 * The Mesh class is responsible for providing the API for how
 * a RenderNode will interact with the WebGL API by adding
 * a set of commands to the renderer.
 *
 * @class Mesh
 * @constructor
 * @renderable
 *
 * @param {Node} node Dispatch LocalDispatch to be retrieved
 * @param {Object} options Optional params for configuring Mesh
 *
 * @return {undefined} undefined
 */
function Mesh (node, options) {
    this._node = node;
    this._changeQueue = [];
    this._initialized = false;
    this._requestingUpdate = false;
    this._inDraw = false;
    this.value = {
        drawOptions: {},
        color: null,
        expressions: {},
        geometry: null,
        flatShading: null,
        glossiness: null,
        positionOffset: null,
        normals: null
    };

    if (options) this.setDrawOptions(options);
    this._id = node.addComponent(this);
}

/**
 * Pass custom options to Mesh, such as a 3 element map
 * which displaces the position of each vertex in world space.
 *
 * @method
 *
 * @param {Object} options Draw options
 * @return {Mesh} Current mesh
 */
Mesh.prototype.setDrawOptions = function setDrawOptions (options) {
    this._changeQueue.push('GL_SET_DRAW_OPTIONS');
    this._changeQueue.push(options);
    return this;
};

/**
 * Get the mesh's custom options.
 *
 * @method
 *
 * @returns {Object} Options
 */
Mesh.prototype.getDrawOptions = function getDrawOptions () {
    return this.value.drawOptions;
};

/**
 * Assigns a geometry to be used for this mesh. Sets the geometry from either
 * a 'Geometry' or a valid primitive (string) name. Queues the set command for this
 * geometry and looks for buffers to send to the renderer to update geometry.
 *
 * @method
 *
 * @param {Geometry|String} geometry Geometry to be associated with the mesh.
 * @param {Object} options Various configurations for geometries.
 *
 * @return {Mesh} Mesh
 */
Mesh.prototype.setGeometry = function setGeometry (geometry, options) {
    if (typeof geometry === 'string') {
        if (!Geometry[geometry]) throw 'Invalid geometry: "' + geometry + '".';
        else geometry = new Geometry[geometry](options);
    }

    if (this.value.geometry !== geometry || this._inDraw) {
        if (this._initialized) {
            this._changeQueue.push('GL_SET_GEOMETRY');
            this._changeQueue.push(geometry.spec.id);
            this._changeQueue.push(geometry.spec.type);
            this._changeQueue.push(geometry.spec.dynamic);
        }
        this._requestUpdate();
        this.value.geometry = geometry;
    }

    if (this._initialized) {
        if (this._node) {
            var i = this.value.geometry.spec.invalidations.length;
            while (i--) {
                this.value.geometry.spec.invalidations.pop();
                this._changeQueue.push('GL_BUFFER_DATA');
                this._changeQueue.push(this.value.geometry.spec.id);
                this._changeQueue.push(this.value.geometry.spec.bufferNames[i]);
                this._changeQueue.push(this.value.geometry.spec.bufferValues[i]);
                this._changeQueue.push(this.value.geometry.spec.bufferSpacings[i]);
                this._changeQueue.push(this.value.geometry.spec.dynamic);
            }
            if (i) this._requestUpdate();
        }
    }
    return this;
};

/**
 * Gets the geometry of a mesh.
 *
 * @method
 *
 * @returns {Geometry} Geometry
 */
Mesh.prototype.getGeometry = function getGeometry () {
    return this.value.geometry;
};

/**
* Changes the color of Mesh, passing either a material expression or
* color using the 'Color' utility component.
*
* @method
*
* @param {Object|Color} color Material, image, vec3, or Color instance
*
* @return {Mesh} Mesh
*/
Mesh.prototype.setBaseColor = function setBaseColor (color) {
    var uniformValue;
    var isMaterial = color.__isAMaterial__;
    var isColor = !!color.getNormalizedRGBA;

    if (isMaterial) {
        this.value.color = null;
        this.value.expressions.baseColor = color;
        uniformValue = color;
    }
    else if (isColor) {
        this.value.expressions.baseColor = null;
        this.value.color = color;
        uniformValue = color.getNormalizedRGBA();
    }

    if (this._initialized) {

        // If a material expression
        if (isMaterial) {
            this._changeQueue.push('MATERIAL_INPUT');
        }

        // If a color component
        else if (isColor) {
            this._changeQueue.push('GL_UNIFORMS');
        }

        this._changeQueue.push('u_baseColor');
        this._changeQueue.push(uniformValue);
    }

    this._requestUpdate();

    return this;
};

/**
 * Returns either the material expression or the color instance of Mesh.
 *
 * @method
 *
 * @returns {MaterialExpress|Color} MaterialExpress or Color instance
 */
Mesh.prototype.getBaseColor = function getBaseColor () {
    return this.value.expressions.baseColor || this.value.color;
};

/**
 * Change whether the Mesh is affected by light. Default is true.
 *
 * @method
 *
 * @param {boolean} bool Boolean for setting flat shading
 *
 * @return {Mesh} Mesh
 */
Mesh.prototype.setFlatShading = function setFlatShading (bool) {
    if (this._inDraw || this.value.flatShading !== bool) {
        this.value.flatShading = bool;
        if (this._initialized) {
            this._changeQueue.push('GL_UNIFORMS');
            this._changeQueue.push('u_flatShading');
            this._changeQueue.push(bool ? 1 : 0);
        }
        this._requestUpdate();
    }

    return this;
};

/**
 * Returns a boolean for whether Mesh is affected by light.
 *
 * @method
 *
 * @returns {Boolean} Boolean
 */
Mesh.prototype.getFlatShading = function getFlatShading () {
    return this.value.flatShading;
};


/**
 * Defines a 3-element map which is used to provide significant physical
 * detail to the surface by perturbing the facing direction of each individual
 * pixel.
 *
 * @method
 *
 * @param {Object|Array} materialExpression Material, Image or vec3
 *
 * @return {Mesh} Mesh
 */
Mesh.prototype.setNormals = function setNormals (materialExpression) {
    var isMaterial = materialExpression.__isAMaterial__;

    if (isMaterial) {
        this.value.expressions.normals = materialExpression;
    }

    if (this._initialized) {
        this._changeQueue.push(isMaterial ? 'MATERIAL_INPUT' : 'UNIFORM_INPUT');
        this._changeQueue.push('u_normals');
        this._changeQueue.push(materialExpression);
    }

    this._requestUpdate();

    return this;
};

/**
 * Returns the Normals expression of Mesh
 *
 * @method
 *
 * @param {materialExpression} materialExpression Normals Material Expression
 *
 * @returns {Array} The normals expression for Mesh
 */
Mesh.prototype.getNormals = function getNormals (materialExpression) {
    return this.value.expressions.normals;
};

/**
 * Defines the glossiness of the mesh from either a material expression or a
 * scalar value
 *
 * @method
 *
 * @param {MaterialExpression|Color} glossiness Accepts either a material expression or Color instance
 * @param {Number} strength Optional value for changing the strength of the glossiness
 *
 * @return {Mesh} Mesh
 */
Mesh.prototype.setGlossiness = function setGlossiness(glossiness, strength) {
    var isMaterial = glossiness.__isAMaterial__;
    var isColor = !!glossiness.getNormalizedRGB;

    if (isMaterial) {
        this.value.glossiness = [null, null];
        this.value.expressions.glossiness = glossiness;
    }
    else if (isColor) {
        this.value.expressions.glossiness = null;
        this.value.glossiness = [glossiness, strength || 20];
        glossiness = glossiness ? glossiness.getNormalizedRGB() : [0, 0, 0];
        glossiness.push(strength || 20);
    }

    if (this._initialized) {
        this._changeQueue.push(isMaterial ? 'MATERIAL_INPUT' : 'GL_UNIFORMS');
        this._changeQueue.push('u_glossiness');
        this._changeQueue.push(glossiness);
    }

    this._requestUpdate();
    return this;
};

/**
 * Returns material expression or scalar value for glossiness.
 *
 * @method
 *
 * @returns {MaterialExpress|Number} MaterialExpress or Number
 */
Mesh.prototype.getGlossiness = function getGlossiness() {
    return this.value.expressions.glossiness || this.value.glossiness;
};

/**
 * Defines 3 element map which displaces the position of each vertex in world
 * space.
 *
 * @method
 *
 * @param {MaterialExpression|Array} materialExpression Position offset expression
 *
 * @return {Mesh} Mesh
 */
Mesh.prototype.setPositionOffset = function positionOffset(materialExpression) {
    var uniformValue;
    var isMaterial = materialExpression.__isAMaterial__;

    if (isMaterial) {
        this.value.expressions.positionOffset = materialExpression;
        uniformValue = materialExpression;
    }
    else {
        this.value.expressions.positionOffset = null;
        this.value.positionOffset = materialExpression;
        uniformValue = this.value.positionOffset;
    }

    if (this._initialized) {
        this._changeQueue.push(isMaterial ? 'MATERIAL_INPUT' : 'GL_UNIFORMS');
        this._changeQueue.push('u_positionOffset');
        this._changeQueue.push(uniformValue);
    }

    this._requestUpdate();

    return this;
};

/**
 * Returns position offset.
 *
 * @method
 *
 * @returns {MaterialExpress|Number} MaterialExpress or Number
 */
Mesh.prototype.getPositionOffset = function getPositionOffset () {
    return this.value.expressions.positionOffset || this.value.positionOffset;
};

/**
 * Get the mesh's expressions
 *
 * @method
 *
 * @returns {Object} Object
 */
Mesh.prototype.getMaterialExpressions = function getMaterialExpressions () {
    return this.value.expressions;
};

/**
 * Get the mesh's value
 *
 * @method
 *
 * @returns {Number} Value
 */
Mesh.prototype.getValue = function getValue () {
    return this.value;
};

/**
 * Queues the invalidations for Mesh
 *
 * @param {String} expressionName Expression Name
 *
 * @return {Mesh} Mesh
 */
Mesh.prototype._pushInvalidations = function _pushInvalidations (expressionName) {
    var uniformKey;
    var expression = this.value.expressions[expressionName];
    if (expression) {
        var i = expression.invalidations.length;
        while (i--) {
            uniformKey = expression.invalidations.pop();
            this._node.sendDrawCommand('GL_UNIFORMS');
            this._node.sendDrawCommand(uniformKey);
            this._node.sendDrawCommand(expression.uniforms[uniformKey]);
        }
    }
    return this;
};

/**
* Sends draw commands to the renderer
*
* @private
* @method
*
* @return {undefined} undefined
*/
Mesh.prototype.onUpdate = function onUpdate() {
    var node = this._node;
    var queue = this._changeQueue;

    if (node) {
        node.sendDrawCommand('WITH');
        node.sendDrawCommand(node.getLocation());

        // If any invalidations exist, push them into the queue
        if (this.value.color && this.value.color.isActive()) {
            this._node.sendDrawCommand('GL_UNIFORMS');
            this._node.sendDrawCommand('u_baseColor');
            this._node.sendDrawCommand(this.value.color.getNormalizedRGBA());
            this._node.requestUpdateOnNextTick(this._id);
        }
        if (this.value.glossiness && this.value.glossiness[0] && this.value.glossiness[0].isActive()) {
            this._node.sendDrawCommand('GL_UNIFORMS');
            this._node.sendDrawCommand('u_glossiness');
            var glossiness = this.value.glossiness[0].getNormalizedRGB();
            glossiness.push(this.value.glossiness[1]);
            this._node.sendDrawCommand(glossiness);
            this._node.requestUpdateOnNextTick(this._id);
        }
        else {
            this._requestingUpdate = false;
        }

        // If any invalidations exist, push them into the queue
        this._pushInvalidations('baseColor');
        this._pushInvalidations('positionOffset');

        for (var i = 0; i < queue.length; i++) {
            node.sendDrawCommand(queue[i]);
        }

        queue.length = 0;
    }
};

/**
 * Save reference to node, set its ID and call draw on Mesh.
 *
 * @method
 *
 * @param {Node} node Node
 * @param {Number} id Identifier for Mesh
 *
 * @return {undefined} undefined
 */
Mesh.prototype.onMount = function onMount (node, id) {
    this._node = node;
    this._id = id;

    this.draw();
};

/**
 * Queues the command for dismounting Mesh
 *
 * @method
 *
 * @return {undefined} undefined
 */
Mesh.prototype.onDismount = function onDismount () {
    this._initialized = false;
    this._changeQueue.push('GL_REMOVE_MESH');

    this._requestUpdate();
};

/**
 * Makes Mesh visible
 *
 * @method
 *
 * @return {undefined} undefined
 */
Mesh.prototype.onShow = function onShow () {
    this._changeQueue.push('GL_MESH_VISIBILITY', true);

    this._requestUpdate();
};

/**
 * Makes Mesh hidden
 *
 * @method
 *
 * @return {undefined} undefined
 */
Mesh.prototype.onHide = function onHide () {
    this._changeQueue.push('GL_MESH_VISIBILITY', false);

    this._requestUpdate();
};

/**
 * Receives transform change updates from the scene graph.
 *
 * @method
 * @private
 *
 * @param {Array} transform Transform matric
 *
 * @return {undefined} undefined
 */
Mesh.prototype.onTransformChange = function onTransformChange (transform) {
    if (this._initialized) {
        this._changeQueue.push('GL_UNIFORMS');
        this._changeQueue.push('u_transform');
        this._changeQueue.push(transform);
    }

    this._requestUpdate();
};

/**
 * Receives size change updates from the scene graph.
 *
 * @method
 * @private
 *
 * @param {Array} size Size
 *
 * @return {undefined} undefined
 */
Mesh.prototype.onSizeChange = function onSizeChange (size) {
    if (this._initialized) {
        this._changeQueue.push('GL_UNIFORMS');
        this._changeQueue.push('u_size');
        this._changeQueue.push(size);
    }

    this._requestUpdate();
};

/**
 * Receives opacity change updates from the scene graph.
 *
 * @method
 * @private
 *
 * @param {Number} opacity Opacity
 *
 * @return {undefined} undefined
 */
Mesh.prototype.onOpacityChange = function onOpacityChange (opacity) {
    if (this._initialized) {
        this._changeQueue.push('GL_UNIFORMS');
        this._changeQueue.push('u_opacity');
        this._changeQueue.push(opacity);
    }

    this._requestUpdate();
};

/**
 * Adds functionality for UI events (TODO)
 *
 * @method
 *
 * @param {String} UIEvent UI Event
 *
 * @return {undefined} undefined
 */
Mesh.prototype.onAddUIEvent = function onAddUIEvent (UIEvent) {
    //TODO
};

/**
 * Queues instance to be updated.
 *
 * @method
 *
 * @return {undefined} undefined
 */
Mesh.prototype._requestUpdate = function _requestUpdate () {
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }
};

/**
 * Initializes the mesh with appropriate listeners.
 *
 * @method
 *
 * @return {undefined} undefined
 */
Mesh.prototype.init = function init () {
    this._initialized = true;
    this.onTransformChange(this._node.getTransform());
    this.onSizeChange(this._node.getSize());
    this.onOpacityChange(this._node.getOpacity());
    this._requestUpdate();
};

/**
 * Draws given Mesh's current state.
 *
 * @method
 *
 * @return {undefined} undefined
 */
Mesh.prototype.draw = function draw () {
    this._inDraw = true;

    this.init();

    var value = this.getValue();

    if (value.geometry != null) this.setGeometry(value.geometry);
    if (value.color != null) this.setBaseColor(value.color);
    if (value.glossiness != null) this.setGlossiness.apply(this, value.glossiness);
    if (value.drawOptions != null) this.setDrawOptions(value.drawOptions);
    if (value.flatShading != null) this.setFlatShading(value.flatShading);

    if (value.expressions.normals != null) this.setNormals(value.expressions.normals);
    if (value.expressions.baseColor != null) this.setBaseColor(value.expressions.baseColor);
    if (value.expressions.glossiness != null) this.setGlossiness(value.expressions.glossiness);
    if (value.expressions.positionOffset != null) this.setPositionOffset(value.expressions.positionOffset);

    this._inDraw = false;
};

module.exports = Mesh;
