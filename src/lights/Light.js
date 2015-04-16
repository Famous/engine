'use strict';

/**
 * The blueprint for all light components for inheriting common functionality.
 *
 * @class Light
 * @constructor
 * @component
 * @param {Node} node The controlling node
 * from the corresponding Render Node
 */
function Light(node) {
    this._node = node;
    this._id = node.addComponent(this);
    this._requestingUpdate = false;
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
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }
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
* Sends draw commands to the renderer
*
* @private
* @method onUpdate
*/
Light.prototype.onUpdate = function clean() {
    var path = this._node.getLocation();

    this._node
        .sendDrawCommand('WITH')
        .sendDrawCommand(path);

    var i = this.queue.length;
    while (i--) {
        this._node.sendDrawCommand(this.queue.shift());
    }

    if (this._color && this._color.isActive()) {
        this._node.sendDrawCommand(this.commands.color);
        var rgb = this._color.getNormalizedRGB();
        this._node.sendDrawCommand(rgb[0]);
        this._node.sendDrawCommand(rgb[1]);
        this._node.sendDrawCommand(rgb[2]);
        this._node.requestUpdateOnNextTick(this._id);
    } else {
        this._requestingUpdate = false;
    }
};

module.exports = Light;
