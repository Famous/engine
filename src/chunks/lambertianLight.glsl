vec3 lambertianLight() {
    vec3 Ia = u_LightAmbient * baseColor;
    vec3 normal = normalize(v_Normal);
    vec3 lightDirection = normalize(-v_LightDirection);
    float nDotL = max(dot(lightDirection, normal), 0.0);
    vec3 diffuse = u_LightColor * baseColor * nDotL;
    return (Ia.r > 0.0 || Ia.g > 0.0 || Ia.b > 0.0) ?  Ia + diffuse : diffuse;
}

#pragma glslify: export(lambertianLight)
