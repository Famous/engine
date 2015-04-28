/**
 * Calculates the intensity of light on a surface.
 *
 * @method applyLight
 * @private
 *
 */
vec3 applyLight(in vec3 material) {
    int numLights = int(u_NumLights);
    vec3 ambientColor = u_AmbientLight * material;
    vec3 normal = normalize(v_Normal);
    vec3 eyeVector = normalize(v_EyeVector);
    vec3 specular = vec3(0.0);
    vec3 diffuse = vec3(0.0);

    for(int i = 0; i < 4; i++) {
        if (i >= numLights) break;
        vec3 lightDirection = normalize(u_LightPosition[i].xyz - v_Position);
        float lambertian = max(dot(lightDirection, normal), 0.0);

        if (lambertian > 0.0) {
            diffuse += u_LightColor[i].rgb * material * lambertian;
        }

        if (glossiness > 0.0) {
            vec3 halfVector = normalize(lightDirection + eyeVector);
            float specular = pow(max(dot(halfVector, normal), 0.0), glossiness);
            diffuse += u_LightColor[i].rgb * specular;
        }
    }

    return ambientColor + diffuse;
}

#pragma glslify: export(applyLight)
