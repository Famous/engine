'use strict';

var PointLight = function PointLight(dispatch) {
    this.dispatch = dispatch;
    this._id = dispatch.addComponent(this);
    this.queue = [];
    this.init();
};

PointLight.toString = function toString() {
    return 'PointLight';
};

PointLight.prototype.init = function init(options) {
    var dispatch = this.dispatch;
    this.queue.push('GL_CREATE_LIGHT');
    this._receiveTransformChange(dispatch.getContext()._transform);
    dispatch.onTransformChange(this._receiveTransformChange.bind(this));
};

PointLight.prototype.setColor = function setColor(r, g, b) {
    var color = (Array.isArray(r)) ? r : [r, g, b];
    this.queue.push('GL_LIGHT_COLOR');
    this.queue.push(color);
    return this;
};

PointLight.prototype._receiveTransformChange = function _receiveTransformChange(transform) {
    this.dispatch.dirtyComponent(this._id);
    this.queue.push('GL_LIGHT_POSITION');
    this.queue.push(transform._matrix);
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

    return !!this.queue.length;
};

module.exports = PointLight;
