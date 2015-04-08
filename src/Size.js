'use strict';

var Transitionable = require('famous-transitions').Transitionable;

/**
 * Size component used for managing the size of the underlying RenderContext.
 * Supports absolute and relative (proportional and differential) sizing.
 * 
 * @class Size
 * @constructor
 * @component
 * 
 * @param {LocalDispatch} dispatch LocalDispatch to be retrieved from
 *                                 corresponding RenderNode of the Size
 *                                 component
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
* Stringifies Size.
*
* @method toString
* 
* @return {String} `Size`
*/
Size.toString = function toString() {
    return 'Size';
};

/**
 * @typedef absoluteSizeState
 * @type {Object}
 * @property {String} type current type of sizing being applied ('absolute')
 * @property {String} component component name ('Size')
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */

/**
 * @typedef relativeSizeState
 * @type {Object}
 * @property {String} type current type of sizing being applied ('relative')
 * @property {String} component component name ('Size')
 * @property {Object} differential
 * @property {number} differential.x
 * @property {number} differential.y
 * @property {number} differential.z
 * @property {Object} proportional
 * @property {number} proportional.x
 * @property {number} proportional.y
 * @property {number} proportional.z
 */

/**
* Returns serialized state of the component.
*
* @method getState
* 
* @return {absoluteSizeState|relativeSizeState}
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
* Updates state of component.
*
* @method setState
* 
* @param {absoluteSizeState|relativeSizeState} state state encoded in same
*                                                    format as state retrieved
*                                                    through `getState`
* @return {Boolean}                                  boolean indicating
*                                                    whether the new state has
*                                                    been applied
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
    if (prop.dirtyX)
        prop.dirtyX = prop.x.isActive();
    return prop.x.get();
};

Size.prototype._cleanAbsoluteY = function _cleanAbsoluteY(prop) {
    if (prop.dirtyY)
        prop.dirtyY = prop.y.isActive();
    return prop.y.get();
};

Size.prototype._cleanAbsoluteZ = function _cleanAbsoluteZ(prop) {
    if (prop.dirtyZ)
        prop.dirtyZ = prop.z.isActive();
    return prop.z.get();
};

/**
*
* If true, component is to be updated on next engine tick
*
* @method clean
* 
* @return {Boolean} boolean indicating whether the component is still dirty
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
* Applies absolute size.
*
* @method setAbsolute
* @chainable
* 
* @param {Number} x used to set absolute size in x-direction (width)
* @param {Number} y used to set absolute size in y-direction (height)
* @param {Number} z used to set absolute size in z-direction (depth)
* @param {Object} options options hash
* @param {Function} callback callback function to be executed after the
*                            transitions have been completed
* @return {Size} this
*/
Size.prototype.setAbsolute = function setAbsolute(x, y, z, options, callback) {
    this._absoluteMode = true;
    this._setSizeType(this._absolute, x, y, z, options, callback);
    return this;
};

Size.prototype._setSizeType = function setProp(prop, x, y, z, options, callback){
    this._dispatch.dirtyComponent(this._id);

    var cbX = null;
    var cbY = null;
    var cbZ = null;

    if (z != null) cbZ = callback;
    else if (y != null) cbY = callback;
    else if (x != null) cbX = callback;

    if (x != null) {
        prop.x.set(x, options, cbX);
        prop.dirtyX = true;
    }
    if (y != null) {
        prop.y.set(y, options, cbY);
        prop.dirtyY = true;
    }
    if (z != null) {
        prop.z.set(z, options, cbZ);
        prop.dirtyZ = true;
    }
};

/**
* Applies proportional size.
*
* @method setProportional
* @chainable
* 
* @param {Number} x used to set proportional size in x-direction (width)
* @param {Number} y used to set proportional size in y-direction (height)
* @param {Number} z used to set proportional size in z-direction (depth)
* @param {Object} options options hash
* @param {Function} callback callback function to be executed after the
*                            transitions have been completed
* @return {Size} this
*/
Size.prototype.setProportional = function setProportional(x, y, z, options, callback) {
    this._absoluteMode = false;
    this._setSizeType(this._proportional, x, y, z, options, callback);
    return this;
};

/**
* Applies differential size to Size component.
*
* @method setDifferential
* @chainable
* 
* @param {Number} x used to set differential size in x-direction (width)
* @param {Number} y used to set differential size in y-direction (height)
* @param {Number} z used to set differential size in z-direction (depth)
* @param {Object} options options hash
* @param {Function} callback callback function to be executed after the
*                            transitions have been completed
*/
Size.prototype.setDifferential = function setDifferential(x, y, z, options, callback) {
    this._absoluteMode = false;
    this._setSizeType(this._differential, x, y, z, options, callback);
    return this;
};

/**
* Retrieves the computed size applied to the underlying RenderContext.
*
* @method get
* 
* @return {Number[]} size three dimensional computed size
*/
Size.prototype.get = function get () {
    return this._dispatch.getContext().getSize();
};

/**
 * Halts all currently active size transitions.
 * 
 * @method halt
 * @chainable
 * 
 * @return {Size} this
 */
Size.prototype.halt = function halt () {
    this._proportional.x.halt();
    this._proportional.y.halt();
    this._proportional.z.halt();
    this._differential.x.halt();
    this._differential.y.halt();
    this._differential.z.halt();
    this._absolute.x.halt();
    this._absolute.y.halt();
    this._absolute.z.halt();
    return this;
};

module.exports = Size;
