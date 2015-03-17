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

// Return the definition of the Component Class: 'Position'
Position.toString = function toString() {
    return 'Position';
};

//Return object containing stringified constructor, x, y, z coordinates
Position.prototype.getState = function getState() {
    return {
        component: this.constructor.toString(),
        x: this._x.get(),
        y: this._y.get(),
        z: this._z.get()
    };
};

// @param {object} state Object -- component: stringified constructor, x: number, y: number, z: number
// If component deeply equals stringified constructor, sets position coordinates and returns boolean true, else returns false
Position.prototype.setState = function setState(state) {
    if (state.component === this.constructor.toString()) {
        this.set(state.x, state.y, state.z);
        return true;
    }
    return false;
};

//Returns numeric x position
Position.prototype.getX = function getX() {
    return this._x.get();
};

//Returns numeric y position
Position.prototype.getY = function getY() {
    return this._y.get();
};

//Returns numeric z position
Position.prototype.getZ = function getZ() {
    return this._z.get();
};

// returns boolean true if any coordinate is active else returns false
Position.prototype.isActive = function isActive() {
    return this._x.isActive() || this._y.isActive() || this._z.isActive();
};

// Returns boolean: if true, component is to be updated on next engine tick
Position.prototype.clean = function clean() {
    var context = this._dispatch.getContext();
    context.setPosition(this._x.get(), this._y.get(), this._z.get());
    return this.isActive();
};

// @param {number} val used to set x coordinate
// @param {object} options options hash
// @param {function} callback function to execute after setting X
// @chainable
Position.prototype.setX = function setX(val, options, callback) {
    this._dispatch.dirtyComponent(this._id);
    this._x.set(val, options, callback);
    return this;
};

// @param {number} val used to set y coordinate
// @param {object} options options hash
// @param {function} callback function to execute after setting Y
// @chainable
Position.prototype.setY = function setY(val, options, callback) {
    this._dispatch.dirtyComponent(this._id);
    this._y.set(val, options, callback);
    return this;
};

// @param {number} val used to set z coordinate
// @param {object} options options hash
// @param {function} callback function to execute after setting Z
// @chainable
Position.prototype.setZ = function setZ(val, options, callback) {
    this._dispatch.dirtyComponent(this._id);
    this._z.set(val, options, callback);
    return this;
};


// @param {number} x used to set x coordinate
// @param {number} y used to set y coordinate
// @param {number} z used to set z coordinate
// @param {object} options options hash
// @param {function} callback function to execute after setting each coordinate
// @chainable
Position.prototype.set = function set(x, y, z, options, callback) {
    this._dispatch.dirtyComponent(this._id);
    this._x.set(x, options);
    this._y.set(y, options);
    this._z.set(z, options, callback);
    return this;
};

// Stops transition of Position component
Position.prototype.halt = function halt() {
    this._x.halt();
    this._y.halt();
    this._z.halt();
    return this;
};

module.exports = Position;
