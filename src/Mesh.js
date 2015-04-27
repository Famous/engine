'use strict';
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
function Mesh (node, options) {
    this._node = node;
    this._changeQueue = [];
    this._initialized = false;
    this._requestingUpdate = false;
    this._inDraw = false;
    this.value = {
        drawOptions: null,
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
 * @method setDrawOptions
 * @chainable
 *
 * @param {Object} Options
 * @chainable
 */
Mesh.prototype.setDrawOptions = function setOptions (options) {
    if (this.value.drawOptions.blendMode) {
        this.value.drawOptions.blendMode = options.blendMode;
        this._changeQueue.push('GL_SET_DRAW_OPTIONS');
        this._changeQueue.push(options);
    } else {
        this.vale.drawOptions = {
            blendMode: options.blendMode
        };
        this._changeQueue.push('GL_SET_DRAW_OPTIONS');
        this._changeQueue.push(options);
    }
    return this;
};

/**
 * Get the mesh's custom options.
 *
 * @method getDrawOptions
 * @returns {Object} Options
 */
Mesh.prototype.getDrawOptions = function getDrawOptions () {
    return this.value.drawOptions;
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
Mesh.prototype.setGeometry = function setGeometry (geometry, options) {
    if (typeof geometry === 'string') {
        if (!Geometry[geometry]) throw 'Invalid geometry: "' + geometry + '".';
        else geometry = new Geometry[geometry](options);
    }

    if (this.value.geometry !== geometry || this._inDraw) {
        if (this._initialized) {
            this._changeQueue.push('GL_SET_GEOMETRY');
            this._changeQueue.push(geometry.id);
            this._changeQueue.push(geometry.spec.type);
            this._changeQueue.push(geometry.spec.dynamic);
        }
        this._requestUpdate();
        this.value.geometry = geometry;
    }

    return this;
};

/**
 * Get the geometry of a mesh.
 *
 * @method getGeometry
 * @returns {Geometry} geometry Geometry of mesh
 */
Mesh.prototype.getGeometry = function getGeometry () {
    return this.value.geometry;
};

/**
* Changes the color of Mesh, passing either a material expression or
* color using the 'Color' utility component.
*
* @method setBaseColor
* @param {Object|Color} Material, image, vec3, or Color instance
* @chainable
*/
Mesh.prototype.setBaseColor = function setBaseColor (color) {
    var uniformValue;
    if (color._compile) {
        this.value.expressions.baseColor = color;
        uniformValue = color._compile(); 
    } else if (color.getNormalizedRGB) {
        this.value.expressions.baseColor = null;
        this.value.color = color;
        uniformValue = color.getNormalizedRGB();
    }

    if (this._initialized) {
        // If a material expression
        if (color._compile) {
            this._changeQueue.push('MATERIAL_INPUT');
        }

        // If a color component
        else if (color.getNormalizedRGB) {
            this._changeQueue.push('GL_UNIFORMS');
        }
        this._changeQueue.push('baseColor');
        this._changeQueue.push(uniformValue);
    }

    this._requestUpdate();

    return this;
};

/**
 * Returns either the material expression or the color instance of Mesh.
 *
 * @method getBaseColor
 * @returns {MaterialExpress|Color}
 */
Mesh.prototype.getBaseColor = function getBaseColor () {
    return this.value.expressions.baseColor || this.value.color;
};

/**
 * Change whether the Mesh is affected by light. Default is true.
 *
 * @method setFlatShading
 * @param {boolean} Boolean
 * @chainable
 */
Mesh.prototype.setFlatShading = function setFlatShading (bool) {
    if (this._inDraw || this.value.flatShading !== bool) {
        this.value.flatShading = bool;
        if (this._initialized) {
            this._changeQueue.push('GL_UNIFORMS');
            this._changeQueue.push('u_FlatShading');
            this._changeQueue.push(bool ? 1 : 0);        
        }
        this._requestUpdate();
    }

    return this;
};

/**
 * Returns a boolean for whether Mesh is affected by light.
 *
 * @method getFlatShading
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
 * @method normal
 * @chainable
 *
 * @param {Object|Array} Material, Image or vec3
 * @return {Element} current Mesh
 */
Mesh.prototype.setNormals = function setNormals (materialExpression) {
    if (materialExpression._compile) {
        this.value.expressions.normals = materialExpression;
        materialExpression = materialExpression._compile();
    }

    if (this._initialized) {
        this._changeQueue.push(materialExpression._compile ? 'MATERIAL_INPUT' : 'UNIFORM_INPUT');
        this._changeQueue.push('normal');
        this._changeQueue.push(materialExpression);
    }

    this._requestUpdate();

    return this;
};

/**
 * Returns the Normals expression of Mesh
 *
 * @method getNormals
 * @returns The normals expression for Mesh
 */
Mesh.prototype.getNormals = function getNormals (materialExpression) {
    return this.value.expressions.normals;
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
Mesh.prototype.setGlossiness = function setGlossiness (materialExpression) {
    var glossiness;

    if (materialExpression._compile) {
        this.value.expressions.glossiness = materialExpression;
        glossiness = materialExpression._compile();
    }
    else {
        this.value.expressions.glossiness = null;
        this.value.glossiness = materialExpression;
        glossiness = this.value.glossiness;
    }

    if (this._initialized) {
        this._changeQueue.push(materialExpression._compile ? 'MATERIAL_INPUT' : 'GL_UNIFORMS');
        this._changeQueue.push('glossiness');
        this._changeQueue.push(glossiness);
    }

    this._requestUpdate();

    return this;
};

/**
 * Returns material expression or scalar value for glossiness.
 *
 * @method getGlossiness
 * @returns {MaterialExpress|Number}
 */
Mesh.prototype.getGlossiness = function getGlossiness () {
    return this.value.expressions.glossiness || this.value.glossiness;
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
Mesh.prototype.setPositionOffset = function positionOffset (materialExpression) {
    var uniformValue;

    if (materialExpression._compile) {
        this.value.expressions.positionOffset = materialExpression;
        uniformValue = materialExpression._compile();
    }
    else {
        this.value.expressions.positionOffset = null;
        this.value.positionOffset = materialExpression;
        uniformValue = this.value.positionOffset;
    }

    if (this._initialized) {
        this._changeQueue.push(materialExpression._compile ? 'MATERIAL_INPUT' : 'GL_UNIFORMS');
        this._changeQueue.push('positionOffset');
        this._changeQueue.push(uniformValue);
    }

    this._requestUpdate();

    return this;
};

/**
 * Returns position offset.
 *
 * @method getPositionOffset
 * @returns {MaterialExpress|Number}
 */
Mesh.prototype.getPositionOffset = function getPositionOffset (materialExpression) {
    return this.value.expressions.positionOffset || this.value.positionOffset;
};

/**
 * Get the mesh's custom options.
 *
 * @method getDrawOptions
 * @returns {Object} Options
 */
Mesh.prototype.getMaterialExpressions = function getMaterialExpressions () {
    return this.value.expressions;
};

Mesh.prototype.getValue = function getValue () {
    return this.value;
};

Mesh.prototype._pushInvalidations = function pushInvalidations (expressionName) {
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
};

/**
* Sends draw commands to the renderer
*
* @private
* @method onUpdate
*/
Mesh.prototype.onUpdate = function onUpdate () {
    var node = this._node;
    var queue = this._changeQueue;

    if (node) {
        node.sendDrawCommand('WITH');
        node.sendDrawCommand(node.getLocation());

        if (this.value.geometry) {
        i = this.value.geometry.spec.invalidations.length;
            while (i--) {
                var bufferIndex = this.value.geometry.spec.invalidations.pop();
                node.sendDrawCommand('GL_BUFFER_DATA');
                node.sendDrawCommand(this.value.geometry.id);
                node.sendDrawCommand(this.value.geometry.spec.bufferNames[i]);
                node.sendDrawCommand(this.value.geometry.spec.bufferValues[i]);
                node.sendDrawCommand(this.value.geometry.spec.bufferSpacings[i]);
            }
        }

        // If any invalidations exist, push them into the queue
        if (this.value.color && this.value.color.isActive()) {
            this._node.sendDrawCommand('GL_UNIFORMS');
            this._node.sendDrawCommand('baseColor');
            this._node.sendDrawCommand(this.value.color.getNormalizedRGB());
            this._node.requestUpdateOnNextTick(this._id);
        } else {
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

Mesh.prototype.onMount = function onMount (node, id) {
    this._node = node;
    this._id = id;

    this.draw();
};

Mesh.prototype.onDismount = function onDismount () {
    this._initialized = false;
    this.onHide();
};

Mesh.prototype.onShow = function onShow () {
    this._changeQueue.push('GL_HIDE_MESH');
};

Mesh.prototype.onHide = function onHide () {
    this._changeQueue.push('GL_HIDE_MESH');
};

/**
 * Receives transform change updates from the scene graph.
 *
 * @private
 */
Mesh.prototype.onTransformChange = function onTransformChange (transform) {
    if (this._initialized) {
        this._changeQueue.push('GL_UNIFORMS');
        this._changeQueue.push('transform');
        this._changeQueue.push(transform);        
    }

    this._requestUpdate();
};

/**
 * Receives size change updates from the scene graph.
 *
 * @private
 */
Mesh.prototype.onSizeChange = function onSizeChange (size) {
    if (this._initialized) {
        this._changeQueue.push('GL_UNIFORMS');
        this._changeQueue.push('size');
        this._changeQueue.push(size);
    }

    this._requestUpdate();
};

/**
 * Receives opacity change updates from the scene graph.
 *
 * @private
 */
Mesh.prototype.onOpacityChange = function onOpacityChange (opacity) {
    if (this._initialized) {
        this._changeQueue.push('GL_UNIFORMS');
        this._changeQueue.push('opacity');
        this._changeQueue.push(opacity);
    }
    
    this._requestUpdate();
};

Mesh.prototype.onAddUIEvent = function onAddUIEvent (UIEvent, methods, properties) {
    //TODO
};

Mesh.prototype._requestUpdate = function _requestUpdate () {
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }
};

Mesh.prototype.init = function init () {
    this._initialized = true;
    this.onTransformChange(this._node.getTransform());
    this.onSizeChange(this._node.getSize());
    this.onOpacityChange(this._node.getOpacity());
    this._requestUpdate();
};

Mesh.prototype.draw = function draw () {
    var key;
    var i;
    var len;

    this._inDraw = true;

    this.init();

    var value = this.getValue();
    if (value.geometry != null) this.setGeometry(value.geometry);
    if (value.color != null) this.setBaseColor(value.color);
    if (value.drawOptions != null) this.setDrawOptions(value.drawOptions);
    if (value.flatShading != null) this.setFlatShading(value.flatShading);
    if (value.expressions.normals != null) this.setNormals(value.expressions.normals);
    if (value.expressions.baseColor != null) this.setBaseColor(value.expressions.baseColor);
    if (value.expressions.glossiness != null) this.setGlossiness(value.expressions.glossiness);
    if (value.expressions.positionOffset != null) this.setPositionOffset(value.expressions.positionOffset);

    this._inDraw = false;
};

module.exports = Mesh;
