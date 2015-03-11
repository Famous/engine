#pragma glslify: applyMaterial = require(./chunks/applyMaterial)
#pragma glslify: applyLight = require(./chunks/applyLight)

void main() {
    vec3 material = baseColor.r >= 0.0 ? baseColor : applyMaterial(baseColor);

    bool lightsEnabled = u_LightColor.r > 0.0 || u_LightColor.g > 0.0 || u_LightColor.b > 0.0;
    vec3 color = lightsEnabled ? applyLight(material) : material;

    bool ambianceEnabled = u_AmbientLight.r > 0.0 || u_AmbientLight.g > 0.0 || u_AmbientLight.b > 0.0;
    vec3 ambience = u_AmbientLight * material;
    vec3 finalColor = ambianceEnabled ? ambience + color : color;

    gl_FragColor = vec4(finalColor, opacity);
}
