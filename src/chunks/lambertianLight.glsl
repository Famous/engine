vec3 lambertianLight(in vec3 material) {
    vec3 normal = normalize(v_Normal);
    vec3 lightDirection = normalize(-v_LightDirection);
    float nDotL = max(dot(lightDirection, normal), 0.0);
    return u_LightColor * material * nDotL;
}

#pragma glslify: export(lambertianLight)
