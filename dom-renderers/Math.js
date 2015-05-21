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

'use strict';

/**
 * A method for inverting a transform matrix
 *
 * @method
 *
 * @param {Array} out array to store the return of the inversion
 * @param {Array} a transform matrix to inverse
 *
 * @return {Array} out
 *   output array that is storing the transform matrix
 */
function invert (out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

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

        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
        return null;
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
}

/**
 * A method for multiplying two matricies
 *
 * @method
 *
 * @param {Array} out array to store the return of the multiplication
 * @param {Array} a transform matrix to multiply
 * @param {Array} b transform matrix to multiply
 *
 * @return {Array} out
 *   output array that is storing the transform matrix
 */
function multiply (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3],
        b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7],
        b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11],
        b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];

    var changed = false;
    var out0, out1, out2, out3;

    out0 = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out1 = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out2 = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out3 = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    changed = changed ?
              changed : out0 === out[0] ||
                        out1 === out[1] ||
                        out2 === out[2] ||
                        out3 === out[3];

    out[0] = out0;
    out[1] = out1;
    out[2] = out2;
    out[3] = out3;

    b0 = b4; b1 = b5; b2 = b6; b3 = b7;
    out0 = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out1 = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out2 = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out3 = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    changed = changed ?
              changed : out0 === out[4] ||
                        out1 === out[5] ||
                        out2 === out[6] ||
                        out3 === out[7];

    out[4] = out0;
    out[5] = out1;
    out[6] = out2;
    out[7] = out3;

    b0 = b8; b1 = b9; b2 = b10; b3 = b11;
    out0 = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out1 = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out2 = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out3 = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    changed = changed ?
              changed : out0 === out[8] ||
                        out1 === out[9] ||
                        out2 === out[10] ||
                        out3 === out[11];

    out[8] = out0;
    out[9] = out1;
    out[10] = out2;
    out[11] = out3;

    b0 = b12; b1 = b13; b2 = b14; b3 = b15;
    out0 = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out1 = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out2 = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out3 = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    changed = changed ?
              changed : out0 === out[12] ||
                        out1 === out[13] ||
                        out2 === out[14] ||
                        out3 === out[15];

    out[12] = out0;
    out[13] = out1;
    out[14] = out2;
    out[15] = out3;

    return out;
}

module.exports = {
    multiply: multiply,
    invert: invert
};
