'use strict';

/**
 * Removes all values not being of a primitive type from an arbitrary object
 * literal.
 *
 * @method strip
 * @memberof Utilities
 * @param  {any}        primitive or (non-)serializable object without
 *                      circular references
 * @return {any}        primitive or (nested) object only containing primitive
 *                      types (serializable)
 */
function strip(obj) {
    switch (obj) {
        case null:
        case undefined:
            return obj;
    }
    switch (obj.constructor) {
        case Boolean:
        case Number:
        case String:
        case Symbol:
            return obj;
        case Object:
            for (var key in obj) {
                var stripped = strip(obj[key], true);
                obj[key] = stripped;
            }
            return obj;
        default:
            return null;
    }
}

module.exports = strip;
