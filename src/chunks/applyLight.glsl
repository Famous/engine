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
    vec3 center = resolution * 0.5;
    vec3 eyeVector = normalize(center - v_Position);
    vec3 specular = vec3(0.0);
    vec3 finalColor = vec3(0.0);

    for(int i = 0; i < 4; i++) {
        if (i >= numLights) break;
        vec3 lightDirection = normalize(u_LightPosition[i].xyz - v_Position);
        float lambertian = max(dot(lightDirection, normal), 0.0);
        vec3 diffuse = u_LightColor[i].rgb * material;

        if (lambertian > 0.0) {
            vec3 halfVector = normalize(lightDirection + eyeVector);
            float specularAngle = max(dot(halfVector, normal), 0.0);
            specular = u_LightColor[i].rgb * pow(specularAngle, glossiness * 10.0);
            if (glossiness > 0.0) finalColor += specular;
        }

        finalColor += lambertian * diffuse;
    }

    return ambientColor + finalColor;
}

#pragma glslify: export(applyLight)
