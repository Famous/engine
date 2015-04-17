'use strict';

var PREFIXES = ['', '-ms-', '-webkit-', '-moz-', '-o-'];

/**
 * A helper function for determining if a CSS property
 * has a vendor prefix.
 *
 * @method vendorPrefix
 * @private
 * 
 * @param {String} property
 */
function vendorPrefix(property) {
    for (var i = 0; i < PREFIXES.length; i++) {
        var prefixed = PREFIXES[i] + property;
        if (document.documentElement.style[prefixed] === '') {
            return prefixed;
        }
    }
    return property;
}

module.exports = vendorPrefix;
