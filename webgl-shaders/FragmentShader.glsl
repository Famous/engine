/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

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
    vec4 material = u_baseColor.r >= 0.0 ? u_baseColor : applyMaterial(u_baseColor);

    /**
     * Apply lights only if flat shading is false
     * and at least one light is added to the scene
     */
    bool lightsEnabled = (u_flatShading == 0.0) && (u_numLights > 0.0 || length(u_ambientLight) > 0.0);

    vec3 normal = normalize(v_normal);
    vec3 tangent = normalize(v_tangent);

    tangent = normalize(tangent - dot(tangent, normal) * normal);
    vec3 bitangent = cross(tangent, normal);
    vec3 normalOffset = u_normals.x < 0.0 ? applyMaterial(u_normals) * 2.0 - 1.0 : vec3(0.0);
    normalOffset.y *= 1.0;

    mat3 TBNMatrix = mat3(tangent, bitangent, normal);
    vec3 newNormal = normalize(TBNMatrix * normalOffset);
    
    // normal = normalize(u_normalMatrix * normal);

    vec4 glossiness = u_glossiness.x < 0.0 ? applyMaterial(u_glossiness) : u_glossiness;
    int numLights = int(u_numLights);
    vec3 eyeVector = normalize(v_eyeVector);
    vec3 ambience = u_ambientLight * u_baseColor.rgb;

    vec4 color = !lightsEnabled ? material :
        applyLight(material, newNormal, glossiness, numLights, ambience,
                   eyeVector, u_lightPosition, u_lightColor, v_position);

    gl_FragColor = vec4((v_tangent + 1.0) * 0.5, 1.0);
    gl_FragColor.a *= u_opacity;
}
