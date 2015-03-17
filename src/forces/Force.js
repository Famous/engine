'use strict';

var _ID = 0;
/**
 * Abstract force manager to apply forces to targets.
 *
 * @virtual
 * @class Force
 */
function Force(targets, options) {
    this.targets = [].concat(targets);
    options = options || {};
    this.setOptions(options);

    this._ID = _ID++;
}

Force.prototype.setOptions = function setOptions(options) {
    for (var key in options) this[key] = options[key];
    this.init(options);
};

/**
 * Method invoked upon instantiation and the setting of options.
 *
 * @method init
 * @param {Object} options The options hash.
 */
Force.prototype.init = function init(options) {};

/**
 * Apply forces on each target.
 *
 * @method update
 * @param {Number} time
 * @param {Number} dt
 */
Force.prototype.update = function update(time, dt) {};

module.exports = Force;
