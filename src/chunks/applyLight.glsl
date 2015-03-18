vec3 applyLight(in vec3 material) {
    vec3 finalColor;
    vec3 ambientLight = u_AmbientLight * material;
    vec3 lightDirection = normalize(u_LightPosition - v_Position);
    vec3 eyeVector = -normalize(vec3(v_Position));
    vec3 normal = normalize(v_Normal);
    float lambertianTerm = dot(lightDirection, normal);
    vec3 diffuse = vec3(0.0, 0.0, 0.0);
    vec3 specular = vec3(0.0, 0.0, 0.0);

    if (lambertianTerm > 0.0 && glossiness > 0.0) {
        diffuse = material * lambertianTerm;
        vec3 E = normalize(eyeVector);
        vec3 R = reflect(lightDirection, normal);
        float specularWeight = pow(max(dot(R, E), 0.0), glossiness);
        specular = u_LightColor * specularWeight;
        finalColor = diffuse + specular;
    }
    else {
        lambertianTerm = max(lambertianTerm, 0.0);
        finalColor = u_LightColor * material * lambertianTerm;
    }

    return ambientLight + finalColor;
}

#pragma glslify: export(applyLight)
