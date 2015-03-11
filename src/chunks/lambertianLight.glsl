vec3 lambertianLight() {
    vec3 normal = normalize(v_Normal);
    vec3 lightDirection = normalize(-v_LightDirection);
    float nDotL = max(dot(lightDirection, normal), 0.0);
    return u_LightColor * baseColor * nDotL;
}

#pragma glslify: export(lambertianLight)
