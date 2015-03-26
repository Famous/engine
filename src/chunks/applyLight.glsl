vec3 applyLight(in vec3 material) {
    int numLights = int(u_NumLights);
    float lambertianTerm;
    vec3 finalColor = vec3(0.0);
    vec3 normal = normalize(v_Normal);
    vec3 ambientLight = u_AmbientLight * material;
    vec3 eyeVector = vec3(-v_Position);
    vec3 diffuse, specular, lightDirection;

    for(int i = 0; i < 4; i++) {
        if (i >= numLights) break;
        diffuse = vec3(0.0, 0.0, 0.0);
        specular = vec3(0.0, 0.0, 0.0);
        lightDirection = normalize(u_LightPosition[i].xyz - v_Position);
        lambertianTerm = dot(lightDirection, normal);
        if (lambertianTerm > 0.0 && glossiness > 0.0) {
            diffuse = material * lambertianTerm;
            vec3 E = normalize(eyeVector);
            vec3 R = reflect(lightDirection, normal);
            float specularWeight = pow(max(dot(R, E), 0.0), glossiness);
            specular = u_LightColor[i].rgb * specularWeight;
            finalColor += diffuse + specular;
        }
        else {
            lambertianTerm = max(lambertianTerm, 0.0);
            finalColor += u_LightColor[i].rgb * material * lambertianTerm;
        }
    }

    return ambientLight + finalColor;
}

#pragma glslify: export(applyLight)
