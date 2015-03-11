#pragma glslify: lambertianLight = require(./lambertianLight)
#pragma glslify: phongLight = require(./phongLight)

vec3 applyLight() {
    vec3 diffuse = (glossiness > 0.0) ? phongLight() : lambertianLight();
    vec3 ambient = u_Ambience * baseColor;
    bool ambianceEnabled = ambient.r > 0.0 || ambient.g > 0.0 || ambient.b > 0.0;
    return ambianceEnabled ? diffuse + ambient : diffuse;
}

#pragma glslify: export(applyLight)
