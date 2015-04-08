'use strict';

/**
 * The blueprint for all light components for inheriting common functionality.
 *
 * @class Light
 * @constructor
 * @component
 * @param {LocalDispatch} dispatch LocalDispatch to be retrieved
 * from the corresponding Render Node
 */
function Light(dispatch) {
    this._dispatch = dispatch;
    this._id = dispatch.addComponent(this);
    this.queue = [];
    this._color;
    this.commands = { color: 'GL_LIGHT_COLOR' };
};

/**
* Returns the definition of the Class: 'Light'
*
* @method toString
* @return {String} definition
*/
Light.toString = function toString() {
    return 'Light';
};

/**
* Changes the color of the light, using the 'Color' utility component.
*
* @method setColor
* @param {Color} Color instance
* @chainable
*/
Light.prototype.setColor = function setColor(color) {
    if (!color.getNormalizedRGB) return false;
    this._dispatch.dirtyComponent(this._id);
    this._color = color;
    this.queue.push(this.commands.color);
    var rgb = this._color.getNormalizedRGB();
    this.queue.push(rgb[0]);
    this.queue.push(rgb[1]);
    this.queue.push(rgb[2]);
    return this;
};

/**
* Returns the current color.

* @method getColor
* @returns {Color} Color.
*/
Light.prototype.getColor = function getColor(option) {
    return this._color;
};

/**
* Returns boolean: if true, component is to be updated on next engine tick
*
* @private
* @method clean
* @returns {Boolean} Boolean
*/
Light.prototype.clean = function clean() {
    var path = this._dispatch.getRenderPath();

    this._dispatch
        .sendDrawCommand('WITH')
        .sendDrawCommand(path);

    var i = this.queue.length;
    while (i--) {
        this._dispatch.sendDrawCommand(this.queue.shift());
    }

    if (this._color && this._color.isActive()) {
        this._dispatch.sendDrawCommand(this.commands.color);
        var rgb = this._color.getNormalizedRGB();
        this._dispatch.sendDrawCommand(rgb[0]);
        this._dispatch.sendDrawCommand(rgb[1]);
        this._dispatch.sendDrawCommand(rgb[2]);
        return true;
    }

    return this.queue.length;
};

module.exports = Light;
