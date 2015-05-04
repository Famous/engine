bool hasGlossiness = glossiness.a > 0.0;
bool hasSpecularColor = length(glossiness.rgb) > 0.0;

/**
 * Calculates the intensity of light on a surface.
 *
 * @method applyLight
 * @private
 *
 */
vec4 applyLight(in vec4 material) {
    int numLights = int(u_NumLights);
    vec3 ambientColor = u_AmbientLight * material.rgb;
    vec3 normal = normalize(v_Normal);
    vec3 eyeVector = normalize(v_EyeVector);
    vec3 diffuse = vec3(0.0);
    bool hasGlossiness = glossiness.a > 0.0;
    bool hasSpecularColor = length(glossiness.rgb) > 0.0;

    for(int i = 0; i < 4; i++) {
        if (i >= numLights) break;
        vec3 lightDirection = normalize(u_LightPosition[i].xyz - v_Position);
        float lambertian = max(dot(lightDirection, normal), 0.0);

        if (lambertian > 0.0) {
            diffuse += u_LightColor[i].rgb * material.rgb * lambertian;
            if (hasGlossiness) {
                vec3 halfVector = normalize(lightDirection + eyeVector);
                float specularWeight = pow(max(dot(halfVector, normal), 0.0), glossiness.a);
                vec3 specularColor = hasSpecularColor ? glossiness.rgb : u_LightColor[i].rgb;
                diffuse += specularColor * specularWeight * lambertian;
            }
        }

    }

    return vec4(ambientColor + diffuse, material.a);
}

#pragma glslify: export(applyLight)
