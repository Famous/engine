'use strict';

/**
 * A list of helper functions
 */
var helpers = {};

helpers.flattenArguments = function(options) {
    return Array.prototype.concat.apply([], options);
};

helpers.argsToArray = function(val) {
    return Array.prototype.slice.call(val);
};

helpers.isArray = function(val) {
    return Array.isArray(val);
};

helpers.isString = function(val) {
    return (typeof val === 'string');
};

helpers.isInt = function(val) {
    return parseInt(val) === val;
};

helpers.isFloat = function(val) {
    return !helpers.isInt(val);
};

helpers.allFloats = function() {
    var val = helpers.argsToArray(arguments);
    for(var i = 0; i < val.length; i++) {
        if (!helpers.isFloat(val[i])) return false;
    }
    return true;
};

helpers.allInts = function(val) {
    return !helpers.allFloats(val);
};

helpers.allStrings = function() {
    var values = helpers.argsToArray(arguments);
    for(var i = 0; i < values.length; i++) {
        if (!helpers.isString(values[i])) return false;
    }
    return true;
};

helpers.isPercentage = function(val) {
    return /%/.test(val);
};

helpers.isHex = function(val) {
    return /#/.test(val);
};

helpers.isType = function(type, value) {
    return helpers.allStrings(type, value) && type.toLowerCase() === value.toLowerCase();
};

helpers.clamp = function(val, min, max) {
    min = min || 0;
    max = max || 255;
    return Math.max(Math.min(val, max), min);
};

/**
 * Expose
 */
module.exports = helpers;
