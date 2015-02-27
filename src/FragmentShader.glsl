#pragma glslify: applyMaterial = require(./chunks/applyMaterial)
#pragma glslify: lambertianLight = require(./chunks/lambertianLight)

void main() {
    vec3 material = baseColor.x >= 0.0 ? baseColor : applyMaterial(baseColor);
    vec3 color = lambertianLight(material, vPosition, vNormal, u_LightPosition, u_LightColor);
    gl_FragColor = vec4(color, opacity);
}
