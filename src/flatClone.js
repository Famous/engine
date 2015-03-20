'use strict';

/**
 * Flat clone an object.
 * @memberof Utilities
 * @param {Object} obj - Object to clone
 * @return {Object} Cloned object
 */
function flatClone(obj) {
    var clone = {};
    for (var key in obj) clone[key] = obj[key];
    return clone;
}

module.exports = flatClone;
