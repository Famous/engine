#pragma glslify: applyMaterial = require(./chunks/applyMaterial)
#pragma glslify: applyLight = require(./chunks/applyLight)

void main() {
    vec3 material = baseColor.r >= 0.0 ? baseColor : applyMaterial(baseColor);

    bool flatShading = u_FlatShading > 0.0;
    bool lights = length(u_LightColor) > 0.0;
    vec3 color = lights && !flatShading ? applyLight(material) : material;

    bool ambience = length(u_AmbientLight) > 0.0;
    vec3 ambientLight = u_AmbientLight * material;
    vec3 finalColor = ambience && !flatShading ? ambientLight + color : color;

    gl_FragColor = vec4(finalColor, opacity);
}
