/**
 * Placeholder for fragmentShader  chunks to be templated in.
 * Used for normal mapping, gloss mapping and colors.
 * 
 * @method applyMaterial
 * @private
 *
 *
 */

#float_definitions
float applyMaterial(float ID) {
    #float_applications
    return 1.;
}

#vec_definitions
vec3 applyMaterial(vec3 ID) {
    #vec_applications
    return vec3(.5);
}

#pragma glslify: export(applyMaterial)
