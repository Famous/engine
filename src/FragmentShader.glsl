#pragma glslify: applyMaterial = require(./chunks/applyMaterial)
#pragma glslify: applyLight = require(./chunks/applyLight)



/**
 * Writes the color of the pixel onto the screen
 *
 * @method main
 * @private
 *
 *
 */
void main() {
    vec3 material = baseColor.r >= 0.0 ? baseColor : applyMaterial(baseColor);

    /**
     * Apply lights only if flat shading is false
     * and at least one light is added to the scene
     */
    bool lightsEnabled = (u_FlatShading == 0.0) && (u_NumLights > 0.0 || length(u_AmbientLight) > 0.0);
    vec3 color = lightsEnabled ? applyLight(material) : material;

    gl_FragColor = vec4(color, opacity);
}
