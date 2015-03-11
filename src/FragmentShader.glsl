#pragma glslify: applyMaterial = require(./chunks/applyMaterial)
#pragma glslify: applyLight = require(./chunks/applyLight)

void main() {
    vec3 material = baseColor.x >= 0.0 ? baseColor : applyMaterial(baseColor);
    bool lightsEnabled = u_LightColor.r > 0.0 || u_LightColor.g > 0.0 || u_LightColor.b > 0.0;
    vec3 color = lightsEnabled ? applyLight(material) : material;
    gl_FragColor = vec4(color, opacity);
}
