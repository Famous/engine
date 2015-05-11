'use strict';

var _ID = 0;
/**
 * Base Constraint class to be used in the Physics
 * Subclass this class to implement a constraint
 *
 * @virtual
 * @class Constraint
 */
function Constraint(options) {
    options = options || {};
    this.setOptions(options);

    this._ID = _ID++;
}

/**
 * Decorates the Constraint with the options object.
 *
 * @method setOptions
 * @param {Object} Options
 */
Constraint.prototype.setOptions = function setOptions(options) {
    for (var key in options) this[key] = options[key];
    this.init(options);
};

/**
 * Method invoked upon instantiation and the setting of options.
 *
 * @method init
 * @param {Object} options The options hash.
 */
Constraint.prototype.init = function init(options) {};

/**
 * Detect violations of the constraint. Warm start the constraint, if possible.
 *
 * @method update
 * @param {Number} time The current time in the physics engine.
 * @param {Number} dt The physics engine frame delta.
 */
Constraint.prototype.update = function update(time, dt) {};

/**
 * Apply impulses to resolve the constraint.
 *
 * @method resolve
 * @param {Number} time The current time in the physics engine.
 * @param {Number} dt The physics engine frame delta.
 */
Constraint.prototype.resolve = function resolve(time, dt) {};

module.exports = Constraint;
