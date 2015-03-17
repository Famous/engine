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
var PointLight = function PointLight(dispatch) {
    Light.call(this, dispatch);

    this.commands = {
        color: 'GL_LIGHT_COLOR',
        position: 'GL_LIGHT_POSITION'
    };

    this._receiveTransformChange(this._dispatch.getContext()._transform);
    this._dispatch.onTransformChange(this._receiveTransformChange.bind(this));
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
PointLight.prototype._receiveTransformChange = function _receiveTransformChange(transform) {
    this._dispatch.dirtyComponent(this._id);
    this.queue.push(this.commands.position);
    this.queue.push(transform._matrix[12]);
    this.queue.push(transform._matrix[13]);
    this.queue.push(transform._matrix[14]);
};

module.exports = PointLight;
