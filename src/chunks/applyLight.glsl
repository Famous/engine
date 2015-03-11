#pragma glslify: lambertianLight = require(./lambertianLight)
#pragma glslify: phongLight = require(./phongLight)

vec3 applyLight(in vec3 material) {
    return (glossiness > 0.0) ? phongLight(material) : lambertianLight(material);
}

#pragma glslify: export(applyLight)
