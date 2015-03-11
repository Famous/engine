#pragma glslify: lambertianLight = require(./lambertianLight)
#pragma glslify: phongLight = require(./phongLight)

vec3 applyLight(in vec3 baseColor) {
    return (glossiness > 0.0) ? phongLight(baseColor) : lambertianLight(baseColor);
}

#pragma glslify: export(applyLight)
