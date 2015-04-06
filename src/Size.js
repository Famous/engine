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
 * @param {LocalDispatch} node LocalDispatch to be retrieved from
 *                                 corresponding RenderNode of the Size
 *                                 component
 */
function Size(node) {
    this._node = node;
    this._id = node.addComponent(this);
    this._requestingUpdate = false;
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

Size.prototype.setMode = function setMode(x, y, z) {
    this._node.setSizeMode(x, y, z);
    return this;
};

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
    return {
        sizeMode: this._node.value.sizeMode,
        absolute: {
            x: this._absolute.x.get(),
            y: this._absolute.y.get(),
            z: this._absolute.z.get()
        },
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
        this.setMode.apply(this, state.sizeMode);
        if (state.absolute) {
            this.setAbsolute(state.absolute.x, state.absolute.y, state.absolute.z);
        }
        if (state.differential) {
            this.setAbsolute(state.differential.x, state.differential.y, state.differential.z);
        }
        if (state.proportional) {
            this.setAbsolute(state.proportional.x, state.proportional.y, state.proportional.z);
        }
    }
    return false;
};

Size.prototype._isActive = function _isActive(type) {
    return type.x.isActive() || type.y.isActive() || type.z.isActive();
};

Size.prototype.isActive = function isActive(){
    return (
        this._isActive(this._absolute) ||
        this._isActive(this._proportional) ||
        this._isActive(this._differential)
    );
};

Size.prototype.onUpdate = function onUpdate() {
    var abs = this._absolute;
    this._node.setAbsoluteSize(
        abs.x.get(),
        abs.y.get(),
        abs.z.get()
    );
    var prop = this._proportional;
    var diff = this._differential;
    this._node.setProportionalSize(
        prop.x.get(),
        prop.y.get(),
        prop.z.get()
    );
    this._node.setDifferentialSize(
        diff.x.get(),
        diff.y.get(),
        diff.z.get()
    );

    if (this.isActive()) this._node.requestUpdateOnNextTick(this._id);
    else this._requestingUpdate = false;
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
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }
    var abs = this._absolute;
    if (x != null) {
        abs.x.set(x, options, callback);
    }
    if (y != null) {
        abs.y.set(y, options, callback);
    }
    if (z != null) {
        abs.z.set(z, options, callback);
    }
    return this;
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
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }
    var prop = this._proportional;
    if (x != null) {
        prop.x.set(x, options, callback);
    }
    if (y != null) {
        prop.y.set(y, options, callback);
    }
    if (z != null) {
        prop.z.set(z, options, callback);
    }
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
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }
    var diff = this._differential;
    if (x != null) {
        diff.x.set(x, options, callback);
    }
    if (y != null) {
        diff.y.set(y, options, callback);
    }
    if (z != null) {
        diff.z.set(z, options, callback);
    }
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
    return this._node.getContext().getSize();
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
