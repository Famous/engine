vec3 phongLight(in vec3 baseColor) {
    vec3 normal = normalize(v_Normal);
    vec3 lightDirection = normalize(v_LightDirection);
    float lambertTerm = dot(normal, -lightDirection);
    vec3 Id = vec3(0.0, 0.0, 0.0);
    vec3 Is = vec3(0.0, 0.0, 0.0);
    if (lambertTerm > 0.0) {
        Id = baseColor * lambertTerm;
        vec3 E = normalize(v_EyeVector);
        vec3 R = reflect(lightDirection, normal);
        float specular = pow(max(dot(R, E), 0.0), glossiness);
        Is = u_LightColor * specular;
    }
    return Id + Is;
}

#pragma glslify: export(phongLight)
