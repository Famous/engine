'use strict';

var Transitionable = require('famous-transitions').Transitionable;

/**
 * @class Size
 * @constructor
 * @component
 * @param {LocalDispatch} dispatch LocalDispatch to be retrieved from corresponding Render Node of the Size component
 */
function Size(dispatch) {
    this._dispatch = dispatch;
    this._id = dispatch.addComponent(this);
    dispatch.dirtyComponent(this._id);
    this._absoluteMode = false;
    this._proportional = {
        x: new Transitionable(1),
        y: new Transitionable(1),
        z: new Transitionable(1)
    };
    this._differential = {
        x: new Transitionable(0),
        y: new Transitionable(0),
        z: new Transitionable(0)
    };
    this._absolute = {
        x: new Transitionable(0),
        y: new Transitionable(0),
        z: new Transitionable(0)
    };
}

/** 
* Return the definition of the Component Class: 'Size'
*
* @method 
*/
Size.toString = function toString() {
    return 'Size';
};

/**
*
* Returns state object
*
* @method 
* @return object containing stringified constructor, x, y, z numeric size
*/
Size.prototype.getState = function getState() {
    if (this._absoluteMode) {
        return {
            component: this.constructor.toString(),
            type: 'absolute',
            x: this._absolute.x.get(),
            y: this._absolute.y.get(),
            z: this._absolute.z.get()
        };
    }
    return {
        component: this.constructor.toString(),
        type: 'relative',
        differential: {
            x: this._differential.x.get(),
            y: this._differential.y.get(),
            z: this._differential.z.get()
        },
        proportional: {
            x: this._proportional.x.get(),
            y: this._proportional.y.get(),
            z: this._proportional.z.get()
        }
    };
};

/**
* 
* Sets state of size
*
* @method
* @param {object} state -- component: stringified constructor, x: number, y: number, z: number
* @return boolean true if component deeply equals stringified constructor, sets position coordinates, else returns false
*/
Size.prototype.setState = function setState(state) {
    if (state.component === this.constructor.toString()) {
        this._absoluteMode = state.type === 'absolute';
        if (this._absoluteMode)
            this.setAbsolute(state.x, state.y, state.z);
        else {
            this.setProportional(state.proportional.x, state.proportional.y, state.proportional.z);
            this.setDifferential(state.differential.x, state.differential.y, state.differential.z);
        }
        return true;
    }
    return false;
};

Size.prototype._cleanAbsoluteX = function _cleanAbsoluteX(prop) {
    if (prop.dirtyX) {
        prop.dirtyX = prop.x.isActive();
        return prop.x.get();
    } else return null;
};

Size.prototype._cleanAbsoluteY = function _cleanAbsoluteY(prop) {
    if (prop.dirtyY) {
        prop.dirtyY = prop.y.isActive();
        return prop.y.get();
    } else return null;
};

Size.prototype._cleanAbsoluteZ = function _cleanAbsoluteZ(prop) {
    if (prop.dirtyZ) {
        prop.dirtyZ = prop.z.isActive();
        return prop.z.get();
    } else return null;
};

/**
*
* If true, component is to be updated on next engine tick
*
* @method
* @return boolean 
*/
Size.prototype.clean = function clean () {
    var context = this._dispatch._context;
    if (this._absoluteMode) {
        var abs = this._absolute;
        context.setAbsolute(
            this._cleanAbsoluteX(abs),
            this._cleanAbsoluteY(abs),
            this._cleanAbsoluteZ(abs)
        );
        return abs.x.isActive() ||
            abs.y.isActive() ||
            abs.z.isActive();
    } else {
        var prop = this._proportional;
        var diff = this._differential;
        context.setProportions(
            this._cleanAbsoluteX(prop),
            this._cleanAbsoluteY(prop),
            this._cleanAbsoluteZ(prop)
        );
        context.setDifferential(
            this._cleanAbsoluteX(diff),
            this._cleanAbsoluteY(diff),
            this._cleanAbsoluteZ(diff)
        );
        return prop.x.isActive() ||
            prop.y.isActive() ||
            prop.z.isActive() ||
            diff.x.isActive() ||
            diff.y.isActive() ||
            diff.z.isActive();
    }
};

/**
*
* Sets absolute Size
*
* @method
* @param {number} x used to set x size
* @param {number} y used to set y size
* @param {number} z used to set z size
* @param {object} options options hash
* @param {function} callback function to execute after setting each size
* @chainable
*/
Size.prototype.setAbsolute = function setAbsolute(x, y, z, options, callback) {
    this._dispatch.dirtyComponent(this._id);
    var abs = this._absolute;
    this._absoluteMode = true;
    if (x != null) {
        abs.x.set(x, options, callback);
        abs.dirtyX = true;
    }
    if (y != null) {
        abs.y.set(y, options, callback);
        abs.dirtyY = true;
    }
    if (z != null) {
        abs.z.set(z, options, callback);
        abs.dirtyZ = true;
    }
    return this;
};

Size.prototype.setProportional = function setProportional(x, y, z, options, callback) {
    this._dispatch.dirtyComponent(this._id);
    this._needsDEBUG = true;
    var prop = this._proportional;
    this._absoluteMode = false;
    if (x != null) {
        prop.x.set(x, options, callback);
        prop.dirtyX = true;
    }
    if (y != null) {
        prop.y.set(y, options, callback);
        prop.dirtyY = true;
    }
    if (z != null) {
        prop.z.set(z, options, callback);
        prop.dirtyZ = true;
    }
    return this;
};

Size.prototype.setDifferential = function setDifferential(x, y, z, options, callback) {
    this._dispatch.dirtyComponent(this._id);
    var prop = this._differential;
    this._absoluteMode = false;
    if (x != null) {
        prop.x.set(x, options, callback);
        prop.dirtyX = true;
    }
    if (y != null) {
        prop.y.set(y, options, callback);
        prop.dirtyY = true;
    }
    if (z != null) {
        prop.z.set(z, options, callback);
        prop.dirtyZ = true;
    }
    return this;
};

/**
*
* Size getter method
*
* @method
* @return array size
*/
Size.prototype.get = function get () {
    return this._dispatch.getContext().getSize();
};

module.exports = Size;
