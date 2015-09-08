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
 * Calculates transpose inverse matrix from transform
 * 
 * @method random
 * @private
 *
 *
 */


mat3 getNormalMatrix_1_0(in mat4 t) {
   mat3 matNorm;
   mat4 a = t;

   float a00 = a[0][0], a01 = a[0][1], a02 = a[0][2], a03 = a[0][3],
   a10 = a[1][0], a11 = a[1][1], a12 = a[1][2], a13 = a[1][3],
   a20 = a[2][0], a21 = a[2][1], a22 = a[2][2], a23 = a[2][3],
   a30 = a[3][0], a31 = a[3][1], a32 = a[3][2], a33 = a[3][3],
   b00 = a00 * a11 - a01 * a10,
   b01 = a00 * a12 - a02 * a10,
   b02 = a00 * a13 - a03 * a10,
   b03 = a01 * a12 - a02 * a11,
   b04 = a01 * a13 - a03 * a11,
   b05 = a02 * a13 - a03 * a12,
   b06 = a20 * a31 - a21 * a30,
   b07 = a20 * a32 - a22 * a30,
   b08 = a20 * a33 - a23 * a30,
   b09 = a21 * a32 - a22 * a31,
   b10 = a21 * a33 - a23 * a31,
   b11 = a22 * a33 - a23 * a32,

   det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
   det = 1.0 / det;

   matNorm[0][0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
   matNorm[0][1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
   matNorm[0][2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

   matNorm[1][0] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
   matNorm[1][1] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
   matNorm[1][2] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

   matNorm[2][0] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
   matNorm[2][1] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
   matNorm[2][2] = (a30 * b04 - a31 * b02 + a33 * b00) * det;

   return matNorm;
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
 * Calculates a matrix that creates the identity when multiplied by m
 * 
 * @method inverse
 * @private
 *
 *
 */


float inverse_2_1(float m) {
    return 1.0 / m;
}

mat2 inverse_2_1(mat2 m) {
    return mat2(m[1][1],-m[0][1],
               -m[1][0], m[0][0]) / (m[0][0]*m[1][1] - m[0][1]*m[1][0]);
}

mat3 inverse_2_1(mat3 m) {
    float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2];
    float a10 = m[1][0], a11 = m[1][1], a12 = m[1][2];
    float a20 = m[2][0], a21 = m[2][1], a22 = m[2][2];

    float b01 =  a22 * a11 - a12 * a21;
    float b11 = -a22 * a10 + a12 * a20;
    float b21 =  a21 * a10 - a11 * a20;

    float det = a00 * b01 + a01 * b11 + a02 * b21;

    return mat3(b01, (-a22 * a01 + a02 * a21), (a12 * a01 - a02 * a11),
                b11, (a22 * a00 - a02 * a20), (-a12 * a00 + a02 * a10),
                b21, (-a21 * a00 + a01 * a20), (a11 * a00 - a01 * a10)) / det;
}

mat4 inverse_2_1(mat4 m) {
    float
        a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],
        a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],
        a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],
        a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    return mat4(
        a11 * b11 - a12 * b10 + a13 * b09,
        a02 * b10 - a01 * b11 - a03 * b09,
        a31 * b05 - a32 * b04 + a33 * b03,
        a22 * b04 - a21 * b05 - a23 * b03,
        a12 * b08 - a10 * b11 - a13 * b07,
        a00 * b11 - a02 * b08 + a03 * b07,
        a32 * b02 - a30 * b05 - a33 * b01,
        a20 * b05 - a22 * b02 + a23 * b01,
        a10 * b10 - a11 * b08 + a13 * b06,
        a01 * b08 - a00 * b10 - a03 * b06,
        a30 * b04 - a31 * b02 + a33 * b00,
        a21 * b02 - a20 * b04 - a23 * b00,
        a11 * b07 - a10 * b09 - a12 * b06,
        a00 * b09 - a01 * b07 + a02 * b06,
        a31 * b01 - a30 * b03 - a32 * b00,
        a20 * b03 - a21 * b01 + a22 * b00) / det;
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
 * Reflects a matrix over its main diagonal.
 * 
 * @method transpose
 * @private
 *
 *
 */


float transpose_3_2(float m) {
    return m;
}

mat2 transpose_3_2(mat2 m) {
    return mat2(m[0][0], m[1][0],
                m[0][1], m[1][1]);
}

mat3 transpose_3_2(mat3 m) {
    return mat3(m[0][0], m[1][0], m[2][0],
                m[0][1], m[1][1], m[2][1],
                m[0][2], m[1][2], m[2][2]);
}

mat4 transpose_3_2(mat4 m) {
    return mat4(m[0][0], m[1][0], m[2][0], m[3][0],
                m[0][1], m[1][1], m[2][1], m[3][1],
                m[0][2], m[1][2], m[2][2], m[3][2],
                m[0][3], m[1][3], m[2][3], m[3][3]);
}




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
    v_normal = transpose_3_2(mat3(inverse_2_1(u_transform))) * invertedNormals;
    vec3 offsetPos = a_pos + calculateOffset(u_positionOffset);
    gl_Position = applyTransform(vec4(offsetPos, 1.0));
}
