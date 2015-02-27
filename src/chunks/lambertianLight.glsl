vec3 lambertianLight(vec3 baseColor, vec3 vPosition, vec3 vNormal, vec3 u_LightPosition, vec3 u_LightColor) {
    vec3 normal = normalize(vNormal);
    vec3 lightDirection = normalize(u_LightPosition - vPosition);
    float nDotL = max(dot(lightDirection, normal), 0.0);
    vec3 diffuse = u_LightColor * baseColor * nDotL;
    return diffuse;
}

#pragma glslify: export(lambertianLight)
