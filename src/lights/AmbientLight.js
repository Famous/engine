'use strict';

/**
 * Module dependencies
 */
var Color = require('famous-utilities').Color;


/**
 * AmbientLight Component
 */
var AmbientLight = function AmbientLight(dispatch) {
    this.dispatch = dispatch;
    this.queue = [];
    this._color = new Color();
    this._id = dispatch.addComponent(this);
};

AmbientLight.toString = function toString() {
    return 'AmbientLight';
};

AmbientLight.prototype.setColor = function setColor() {
    this.dispatch.dirtyComponent(this._id);
    var values = Array.prototype.concat.apply([], arguments);
    if (values[0] instanceof Color) {
        this._color = materialExpression[0];
    }
    else {
        this._color.set(values);
    }
    this.queue.push('GL_AMBIENT_LIGHT');
    var color = this._color.getNormalizedRGB();
    this.queue.push(color[0]);
    this.queue.push(color[1]);
    this.queue.push(color[2]);
    return this;
};

AmbientLight.prototype.clean = function clean() {
    var path = this.dispatch.getRenderPath();

    this.dispatch
        .sendDrawCommand('WITH')
        .sendDrawCommand(path);

    var i = this.queue.length;
    while (i--) {
        this.dispatch.sendDrawCommand(this.queue.shift());
    }

    if (this._color.isActive()) {
        this.dispatch.sendDrawCommand('GL_AMBIENT_LIGHT');
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
module.exports = AmbientLight;
