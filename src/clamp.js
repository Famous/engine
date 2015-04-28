'use strict';

/**
 * Returns a number guaranteed to be within the range [lower, upper].
 *
 * @method clamp
 * 
 * @param  {Number} value value to be processed by clamp
 * @param  {Number} lower lower bound  of the range
 * @param  {Number} upper upper bound of the range
 * @return {Number}       value between [lower, upper]
 */
function clamp(value, lower, upper) {
    return value < lower ? lower : value > upper ? upper : value;
}

module.exports = clamp;

