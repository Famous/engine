#pragma glslify: phongLight = require(./phongLight)

vec3 applyLight(in vec3 material) {
    vec3 lightDirection = normalize(u_LightPosition - v_Position);
    vec3 eyeVector = -normalize(vec3(v_Position));
    return phongLight(material, lightDirection, eyeVector);
}

#pragma glslify: export(applyLight)
