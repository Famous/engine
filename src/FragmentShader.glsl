#pragma glslify: applyMaterial = require(./chunks/applyMaterial)
#pragma glslify: applyLight = require(./chunks/applyLight)

void main() {
    vec3 material = baseColor.r >= 0.0 ? baseColor : applyMaterial(baseColor);

    bool flatShading = u_FlatShading > 0.0;
    bool lights = length(u_LightColor) > 0.0;
    vec3 color = lights && !flatShading ? applyLight(material) : material;

    bool ambianceEnabled = length(u_AmbientLight) > 0.0;
    vec3 ambience = u_AmbientLight * material;
    vec3 finalColor = ambianceEnabled && !flatShading ? ambience + color : color;

    gl_FragColor = vec4(finalColor, opacity);
}
