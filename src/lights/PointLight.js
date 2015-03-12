'use strict';

/**
 * Module dependencies
 */
var Color = require('famous-utilities').Color;


/**
 * PointLight Component
 */
var PointLight = function PointLight(dispatch) {
    this.dispatch = dispatch;
    this.queue = [];
    this._color = new Color();
    this._id = dispatch.addComponent(this);
    init.call(this);
};

PointLight.toString = function toString() {
    return 'PointLight';
};

function init() {
    var dispatch = this.dispatch;
    this._receiveTransformChange(dispatch.getContext()._transform);
    dispatch.onTransformChange(this._receiveTransformChange.bind(this));
};

PointLight.prototype._receiveTransformChange = function _receiveTransformChange(transform) {
    this.dispatch.dirtyComponent(this._id);
    this.queue.push('GL_LIGHT_POSITION');
    this.queue.push(transform._matrix[12]);
    this.queue.push(transform._matrix[13]);
    this.queue.push(transform._matrix[14]);
};

PointLight.prototype.setColor = function setColor() {
    this.dispatch.dirtyComponent(this._id);
    var values = Array.prototype.concat.apply([], arguments);
    if (values[0] instanceof Color) {
        this._color = materialExpression[0];
    }
    else {
        this._color.set(values);
    }
    this.queue.push('GL_LIGHT_COLOR');
    var color = this._color.getNormalizedRGB();
    this.queue.push(color[0]);
    this.queue.push(color[1]);
    this.queue.push(color[2]);
    return this;
};

PointLight.prototype.getColor = function getColor(option) {
    return this._color.getColor(option);
};

PointLight.prototype.clean = function clean() {
    var path = this.dispatch.getRenderPath();

    this.dispatch
        .sendDrawCommand('WITH')
        .sendDrawCommand(path);

    var i = this.queue.length;
    while (i--) {
        this.dispatch.sendDrawCommand(this.queue.shift());
    }

    if (this._color.isActive()) {
        this.dispatch.sendDrawCommand('GL_LIGHT_COLOR');
        var color = this._color.getNormalizedRGB();
        this.dispatch.sendDrawCommand(color[0]);
        this.dispatch.sendDrawCommand(color[1]);
        this.dispatch.sendDrawCommand(color[2]);
        return true;
    }

    return false;
};


/**
 * Expose
 */
module.exports = PointLight;
