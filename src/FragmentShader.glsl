#pragma glslify: applyMaterial = require(./chunks/applyMaterial)
#pragma glslify: lambertianLight = require(./chunks/lambertianLight)
#pragma glslify: phongLight = require(./chunks/phongLight)

void main() {
    vec3 material = baseColor.x >= 0.0 ? baseColor : applyMaterial(baseColor);
    vec3 color = (u_Shininess > 0.0) ? phongLight() : lambertianLight();
    gl_FragColor = vec4(color, opacity);
}
