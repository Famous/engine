'use strict';

/**
 * Module dependencies
 */
var Light = require('./Light');


/**
 * PointLight Component
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

PointLight.toString = function toString() {
    return 'PointLight';
};

PointLight.prototype = Object.create(Light.prototype);
PointLight.prototype.constructor = PointLight;

PointLight.prototype._receiveTransformChange = function _receiveTransformChange(transform) {
    this._dispatch.dirtyComponent(this._id);
    this.queue.push(this.commands.position);
    this.queue.push(transform._matrix[12]);
    this.queue.push(transform._matrix[13]);
    this.queue.push(transform._matrix[14]);
};


/**
 * Expose
 */
module.exports = PointLight;
