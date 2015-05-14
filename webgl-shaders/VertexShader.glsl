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
 * Converts vertex from modelspace to screenspace using transform
 * information from context.
 *
 * @method applyTransform
 * @private
 *
 *
 */

vec4 applyTransform(vec4 pos) {
    //TODO: move this multiplication to application code. 

    /**
     * Currently multiplied in the vertex shader to avoid consuming the complexity of holding an additional
     * transform as state on the mesh object in WebGLRenderer. Multiplies the object's transformation from object space
     * to world space with its transformation from world space to eye space.
     */
    mat4 MVMatrix = u_view * u_transform;

    //TODO: move the origin, sizeScale and y axis inversion to application code in order to amortize redundant per-vertex calculations.

    /**
     * The transform uniform should be changed to the result of the transformation chain:
     *
     * view * modelTransform * invertYAxis * sizeScale * origin
     *
     * which could be simplified to:
     *
     * view * modelTransform * convertToDOMSpace
     *
     * where convertToDOMSpace represents the transform matrix:
     *
     *                           size.x 0       0       size.x 
     *                           0      -size.y 0       size.y
     *                           0      0       1       0
     *                           0      0       0       1
     *
     */

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

    /**
     * Exporting the vertex's position as a varying, in DOM space, to be used for lighting calculations. This has to be in DOM space
     * since light position and direction is derived from the scene graph, calculated in DOM space.
     */

    v_position = (MVMatrix * pos).xyz;

    /**
    * Exporting the eye vector (a vector from the center of the screen) as a varying, to be used for lighting calculations.
    * In clip space deriving the eye vector is a matter of simply taking the inverse of the position, as the position is a vector
    * from the center of the screen. However, since our points are represented in DOM space,
    * the position is a vector from the top left corner of the screen, so some additional math is needed (specifically, subtracting
    * the position from the center of the screen, i.e. half the resolution of the canvas).
    */

    v_eyeVector = (u_resolution * 0.5) - v_position;

    /**
     * Transforming the position (currently represented in dom space) into view space (with our dom space view transform)
     * and then projecting the point into raster both by applying a perspective transformation and converting to clip space
     * (the perspective matrix is a combination of both transformations, therefore it's probably more apt to refer to it as a
     * projection transform).
     */

    pos = u_perspective * MVMatrix * pos;

    return pos;
}

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
    v_textureCoordinate = a_texCoord;
    vec3 invertedNormals = a_normals + (u_normals.x < 0.0 ? calculateOffset(u_normals) * 2.0 - 1.0 : vec3(0.0));
    invertedNormals.y *= -1.0;
    v_normal = transpose(mat3(inverse(u_transform))) * invertedNormals;
    vec3 offsetPos = a_pos + calculateOffset(u_positionOffset);
    gl_Position = applyTransform(vec4(offsetPos, 1.0));
}
