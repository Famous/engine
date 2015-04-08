'use strict';

var Transitionable = require('famous-transitions').Transitionable;

/**
 * @class Position
 * @constructor
 * @component
 * @param {LocalDispatch} dispatch LocalDispatch to be retrieved from corresponding Render Node of the Position component
 */
function Position(dispatch) {
    this._dispatch = dispatch;
    this._id = dispatch.addComponent(this);
    this._x = new Transitionable(0);
    this._y = new Transitionable(0);
    this._z = new Transitionable(0);
}

/** 
*
* stringifies Position constructor
*
* @method
* @return {String} the definition of the Component Class: 'Position'
*/
Position.toString = function toString() {
    return 'Position';
};

/**
*
* Gets object containing stringified constructor, x, y, z coordinates
*
* @method
* @return {Object}
*/
Position.prototype.getState = function getState() {
    return {
        component: this.constructor.toString(),
        x: this._x.get(),
        y: this._y.get(),
        z: this._z.get()
    };
};

/**
*
* Setter for position coordinates
*
* @method
* @param {Object} state Object -- component: stringified constructor, x: number, y: number, z: number
* @return {Boolean} true on success
*/
Position.prototype.setState = function setState(state) {
    if (state.component === this.constructor.toString()) {
        this.set(state.x, state.y, state.z);
        return true;
    }
    return false;
};

/**
*
* Getter for X position
*
* @method
* @return {Number}
*/
Position.prototype.getX = function getX() {
    return this._x.get();
};

/**
*
* Getter for Y position
*
* @method
* @return {Number}
*/
Position.prototype.getY = function getY() {
    return this._y.get();
};

/**
*
* Getter for Z position
*
* @method
* @return {Number}
*/
Position.prototype.getZ = function getZ() {
    return this._z.get();
};

/**
*
* Getter for any active coordinates
*
* @method
* @return {Boolean}
*/
Position.prototype.isActive = function isActive() {
    return this._x.isActive() || this._y.isActive() || this._z.isActive();
};

/** 
*
* If true, component is to be updated on next engine tick
*
* @method
* @return {Boolean}
*/
Position.prototype.clean = function clean() {
    var context = this._dispatch.getContext();
    context.setPosition(this._x.get(), this._y.get(), this._z.get());
    return this.isActive();
};

/** 
*
* Setter for X position
*
* @method
* @param {Number} val used to set x coordinate
* @param {Object} options options hash
* @param {Function} callback function to execute after setting X
* @chainable
*/
Position.prototype.setX = function setX(val, options, callback) {
    this._dispatch.dirtyComponent(this._id);
    this._x.set(val, options, callback);
    return this;
};

/** 
*
* Setter for Y position
*
* @method
* @param {Number} val used to set y coordinate
* @param {Object} options options hash
* @param {Function} callback function to execute after setting Y
* @chainable
*/
Position.prototype.setY = function setY(val, options, callback) {
    this._dispatch.dirtyComponent(this._id);
    this._y.set(val, options, callback);
    return this;
};

/** 
*
* Setter for Z position
*
* @method
* @param {Number} val used to set z coordinate
* @param {Object} options options hash
* @param {Function} callback function to execute after setting Z
* @chainable
*/
Position.prototype.setZ = function setZ(val, options, callback) {
    this._dispatch.dirtyComponent(this._id);
    this._z.set(val, options, callback);
    return this;
};


/**
*
* Setter for XYZ position with callback
*
* @method
* @param {Number} x used to set x coordinate
* @param {Number} y used to set y coordinate
* @param {Number} z used to set z coordinate
* @param {Object} options options hash
* @param {Function} callback function to execute after setting each coordinate
* @chainable
*/
Position.prototype.set = function set(x, y, z, options, callback) {
    this._dispatch.dirtyComponent(this._id);
    var cbX = null;
    var cbY = null;
    var cbZ = null;

    if (z != null) cbZ = callback;
    else if (y != null) cbY = callback;
    else if (x != null) cbX = callback;

    if (x != null) this._x.set(x, options, cbX);
    if (y != null) this._y.set(y, options, cbY);
    if (z != null) this._z.set(z, options, cbZ);
    return this;
};

/**
*
* Stops transition of Position component
*
* @method
* @chainable
*/
Position.prototype.halt = function halt() {
    this._x.halt();
    this._y.halt();
    this._z.halt();
    return this;
};

module.exports = Position;
