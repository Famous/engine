/**
 * Calculates a pseudorandom number 
 * 
 * @method random
 * @private
 *
 *
 */

float random(vec2 co) {
    return fract(sin(dot(co.xy,vec2(12.9898,78.233))) * 43758.5453);
}

#pragma glslify: export(random)
