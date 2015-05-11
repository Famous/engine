'use strict';

var Light = require('./Light');

/**
 * PointLight extends the functionality of Light. PointLight is a light source
 * that emits light in all directions from a point in space.
 *
 * @class PointLight
 * @constructor
 * @component
 * @param {LocalDispatch} dispatch LocalDispatch to be retrieved
 * from the corresponding Render Node
 */
function PointLight(node) {
    Light.call(this, node);
    this.commands.position = 'GL_LIGHT_POSITION';
    this.onTransformChange(node.getTransform());
};

/**
* Returns the definition of the Class: 'PointLight'
*
* @method toString
* @return {string} definition
*/
PointLight.toString = function toString() {
    return 'PointLight';
};

/**
 * Extends Light constructor
 */
PointLight.prototype = Object.create(Light.prototype);

/**
 * Sets PointLight as the constructor
 */
PointLight.prototype.constructor = PointLight;

/**
 * Receives transform change updates from the scene graph.
 *
 * @private
 */
PointLight.prototype.onTransformChange = function onTransformChange (transform) {
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }
    this.queue.push(this.commands.position);
    this.queue.push(transform[12]);
    this.queue.push(transform[13]);
    this.queue.push(transform[14]);
};

module.exports = PointLight;
