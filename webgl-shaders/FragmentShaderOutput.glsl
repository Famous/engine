#define GLSLIFY 1
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

/**
 * Placeholder for fragmentShader  chunks to be templated in.
 * Used for normal mapping, gloss mapping and colors.
 * 
 * @method applyMaterial
 * @private
 *
 *
 */

#float_definitions
float applyMaterial_1_0(float ID) {
    #float_applications
    return 1.;
}

#vec3_definitions
vec3 applyMaterial_1_0(vec3 ID) {
    #vec3_applications
    return vec3(0);
}

#vec4_definitions
vec4 applyMaterial_1_0(vec4 ID) {
    #vec4_applications

    return vec4(0);
}



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

/**
 * Calculates the intensity of light on a surface.
 *
 * @method applyLight
 * @private
 *
 */
vec4 applyLight_2_1(in vec4 baseColor, in vec3 normal, in vec4 glossiness, int numLights, vec3 ambientColor, vec3 eyeVector, mat4 lightPosition, mat4 lightColor, vec3 v_position) {
    vec3 diffuse = vec3(0.0);
    bool hasGlossiness = glossiness.a > 0.0;
    bool hasSpecularColor = length(glossiness.rgb) > 0.0;

    for(int i = 0; i < 4; i++) {
        if (i >= numLights) break;
        vec3 lightDirection = normalize(lightPosition[i].xyz - v_position);
        float lambertian = max(dot(lightDirection, normal), 0.0);

        if (lambertian > 0.0) {
            diffuse += lightColor[i].rgb * baseColor.rgb * lambertian;
            if (hasGlossiness) {
                vec3 halfVector = normalize(lightDirection + eyeVector);
                float specularWeight = pow(max(dot(halfVector, normal), 0.0), glossiness.a);
                vec3 specularColor = hasSpecularColor ? glossiness.rgb : lightColor[i].rgb;
                diffuse += specularColor * specularWeight * lambertian;
            }
        }

    }

    return vec4(ambientColor + diffuse, baseColor.a);
}





/**
 * Writes the color of the pixel onto the screen
 *
 * @method main
 * @private
 *
 *
 */
void main() {
    vec4 material = u_baseColor.r >= 0.0 ? u_baseColor : applyMaterial_1_0(u_baseColor);

    /**
     * Apply lights only if flat shading is false
     * and at least one light is added to the scene
     */
    bool lightsEnabled = (u_flatShading == 0.0) && (u_numLights > 0.0 || length(u_ambientLight) > 0.0);

    vec3 normal = normalize(v_normal);
    vec4 glossiness = u_glossiness.x < 0.0 ? applyMaterial_1_0(u_glossiness) : u_glossiness;

    vec4 color = lightsEnabled ?
    applyLight_2_1(material, normalize(v_normal), glossiness,
               int(u_numLights),
               u_ambientLight * u_baseColor.rgb,
               normalize(v_eyeVector),
               u_lightPosition,
               u_lightColor,   
               v_position)
    : material;

    gl_FragColor = color;
    gl_FragColor.a *= u_opacity;   
}
