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
vec4 applyLight(in vec4 baseColor, in vec3 normal, in vec4 gloss) {
    int numLights = int(u_NumLights);
    vec3 ambientColor = u_AmbientLight * baseColor.rgb;
    vec3 eyeVector = normalize(v_EyeVector);
    vec3 diffuse = vec3(0.0);
    bool hasGlossiness = gloss.a > 0.0;
    bool hasSpecularColor = length(gloss.rgb) > 0.0;

    for(int i = 0; i < 4; i++) {
        if (i >= numLights) break;
        vec3 lightDirection = normalize(u_LightPosition[i].xyz - v_Position);
        float lambertian = max(dot(lightDirection, normal), 0.0);

        if (lambertian > 0.0) {
            diffuse += u_LightColor[i].rgb * baseColor.rgb * lambertian;
            if (hasGlossiness) {
                vec3 halfVector = normalize(lightDirection + eyeVector);
                float specularWeight = pow(max(dot(halfVector, normal), 0.0), gloss.a);
                vec3 specularColor = hasSpecularColor ? gloss.rgb : u_LightColor[i].rgb;
                diffuse += specularColor * specularWeight * lambertian;
            }
        }

    }

    return vec4(ambientColor + diffuse, baseColor.a);
}

#pragma glslify: export(applyLight)
