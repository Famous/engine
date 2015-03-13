#pragma glslify: lambertianLight = require(./lambertianLight)
#pragma glslify: phongLight = require(./phongLight)

vec3 applyLight(in vec3 material) {
    vec3 lightDirection = normalize(v_Position - u_LightPosition);
    vec3 eyeVector = -normalize(vec3(v_Position));
    return (glossiness > 0.0) ? phongLight(material, lightDirection, eyeVector) : lambertianLight(material, lightDirection);
}

#pragma glslify: export(applyLight)
