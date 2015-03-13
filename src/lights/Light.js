'use strict';

/**
 * Module dependencies
 */
var Color = require('famous-utilities').Color;


/**
 * Light Component
 */
var Light = function Light(dispatch) {
    this.dispatch = dispatch;
    this._id = dispatch.addComponent(this);
    this.queue = [];
    this._color = new Color();
    this.commands = { color: '' };
};

Light.toString = function toString() {
    return 'Light';
};

Light.prototype.setColor = function setColor() {
    this.dispatch.dirtyComponent(this._id);
    var values = Color.flattenArguments(arguments);

    if (values[0] instanceof Color) {
        this._color = materialExpression[0];
    }

    this._color.set(values);
    this.queue.push(this.commands.color);
    var color = this._color.getNormalizedRGB();
    this.queue.push(color[0]);
    this.queue.push(color[1]);
    this.queue.push(color[2]);
    return this;
};

Light.prototype.getColor = function getColor(option) {
    return this._color.getColor(option);
};

Light.prototype.clean = function clean() {
    var path = this.dispatch.getRenderPath();

    this.dispatch
        .sendDrawCommand('WITH')
        .sendDrawCommand(path);

    var i = this.queue.length;
    while (i--) {
        this.dispatch.sendDrawCommand(this.queue.shift());
    }

    if (this._color.isActive()) {
        this.dispatch.sendDrawCommand(this.commands.color);
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
module.exports = Light;
