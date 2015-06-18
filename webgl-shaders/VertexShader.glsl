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

#pragma glslify: getNormalMatrix = require(./chunks/getNormalMatrix)
#pragma glslify: inverse = require(./chunks/inverse)
#pragma glslify: transpose = require(./chunks/transpose)

/**
 * Placeholder for positionOffset chunks to be templated in.
 * Used for mesh deformation.
 *
 * @method calculateOffset
 * @private
 *
 *
 */
#vert_definitions
vec3 calculateOffset(vec3 ID) {
    #vert_applications
    return vec3(0.0);
}

vec3 clipSpacePos(in vec3 pos) {
    /**
     * Assuming a unit volume, moves the object space origin [0, 0, 0] to the "top left" [1, -1, 0], the DOM space origin.
     * Later in the transformation chain, the projection transform negates the rigidbody translation.
     * Equivalent to (but much faster than) multiplying a translation matrix "origin"
     *
     *                           1 0 0 1 
     *                           0 1 0 -1
     *                           0 0 1 0
     *                           0 0 0 1
     *
     * in the transform chain: projection * view * modelTransform * invertYAxis * sizeScale * origin * positionVector.
     */
    pos.x += 1.0;
    pos.y -= 1.0;

    /**
     * Assuming a unit volume, scales an object to the amount of pixels in the size uniform vector's specified dimensions.
     * Later in the transformation chain, the projection transform transforms the point into clip space by scaling
     * by the inverse of the canvas' resolution.
     * Equivalent to (but much faster than) multiplying a scale matrix "sizeScale"
     *
     *                           size.x 0      0      0 
     *                           0      size.y 0      0
     *                           0      0      size.z 0
     *                           0      0      0      1
     *
     * in the transform chain: projection * view * modelTransform * invertYAxis * sizeScale * origin * positionVector.
     */
    pos.xyz *= u_size * 0.5;

    /**
     * Inverts the object space's y axis in order to match DOM space conventions. 
     * Later in the transformation chain, the projection transform reinverts the y axis to convert to clip space.
     * Equivalent to (but much faster than) multiplying a scale matrix "invertYAxis"
     *
     *                           1 0 0 0 
     *                           0 -1 0 0
     *                           0 0 1 0
     *                           0 0 0 1
     *
     * in the transform chain: projection * view * modelTransform * invertYAxis * sizeScale * origin * positionVector.
     */
    pos.y *= -1.0;

    return pos;
}

/**
 * Writes the position of the vertex onto the screen.
 * Passes texture coordinate and normal attributes as varyings
 * and passes the position attribute through position pipeline.
 *
 * @method main
 * @private
 *
 *
 */
void main() {
    vec3 offsetPos,
        invertedNormals;

    vec4 pos4;

    v_textureCoordinate = a_texCoord;

    invertedNormals = a_normals;
    invertedNormals.y *= -1.0;
    v_normal = u_normalMatrix * invertedNormals;

    offsetPos = a_pos + calculateOffset(u_positionOffset);
    offsetPos = clipSpacePos(offsetPos);
    pos4 = vec4(offsetPos, 1.0);
    v_position  = (u_mvMatrix * pos4).xyz;
    v_eyeVector = (u_resolution * 0.5) - v_position;
    gl_Position = u_perspective * u_mvMatrix * pos4;
}
