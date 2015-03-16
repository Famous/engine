vec3 phongLight(in vec3 material, in vec3 lightDirection, in vec3 eyeVector) {
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
        return diffuse + specular;
    }
    else {
        lambertianTerm = max(lambertianTerm, 0.0);
        return u_LightColor * material * lambertianTerm;
    }
}

#pragma glslify: export(phongLight)
