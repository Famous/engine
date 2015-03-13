vec3 lambertianLight(in vec3 material, in vec3 lightDirection) {
    vec3 normal = normalize(v_Normal);
    float nDotL = max(dot(-lightDirection, normal), 0.0);
    return u_LightColor * material * nDotL;
}

#pragma glslify: export(lambertianLight)
