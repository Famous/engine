#pragma glslify: lambertianLight = require(./lambertianLight)
#pragma glslify: phongLight = require(./phongLight)

vec3 applyLight(in vec3 baseColor) {
    vec3 diffuse = (glossiness > 0.0) ? phongLight(baseColor) : lambertianLight(baseColor);
    vec3 ambience = u_AmbientLight * baseColor;
    bool ambianceEnabled = ambience.r > 0.0 || ambience.g > 0.0 || ambience.b > 0.0;
    return ambianceEnabled ? diffuse + ambience : diffuse;
}

#pragma glslify: export(applyLight)
