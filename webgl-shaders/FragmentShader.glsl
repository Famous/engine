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
    vec4 material = baseColor.r >= 0.0 ? baseColor : applyMaterial(baseColor);

    /**
     * Apply lights only if flat shading is false
     * and at least one light is added to the scene
     */
    bool lightsEnabled = (u_FlatShading == 0.0) && (u_NumLights > 0.0 || length(u_AmbientLight) > 0.0);

    vec3 normal = normalize(v_Normal);
    vec4 gloss = glossiness.x < 0.0 ? applyMaterial(glossiness) : glossiness;

    vec4 color = lightsEnabled ? applyLight(material, normalize(v_Normal), gloss) : material;

    gl_FragColor = color;
    gl_FragColor.a *= opacity;   
}
