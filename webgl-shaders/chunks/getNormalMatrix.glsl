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


mat3 getNormalMatrix(in mat4 t) {
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

#pragma glslify: export(getNormalMatrix)
