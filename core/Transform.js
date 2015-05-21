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
 * The transform class is responsible for calculating the transform of a particular
 * node from the data on the node and its parent
 *
 * @constructor Transform
 */
function Transform () {
    this._matrix = new Float32Array(16);
}

/**
 * Returns the last calculated transform
 *
 * @return {Array} a transform
 */
Transform.prototype.get = function get () {
    return this._matrix;
};

/**
 * Uses the parent transform, the node's spec, the node's size, and the parent's size
 * to calculate a final transform for the node. Returns true if the transform has changed.
 *
 * @param {Array} parentMatrix the parent matrix
 * @param {Node.Spec} spec the target node's spec
 * @param {Array} mySize the size of the node
 * @param {Array} parentSize the size of the parent
 * @param {Array} target the target array to write the resulting transform to
 *
 * @return {Boolean} whether or not the transform changed
 */
Transform.prototype.fromSpecWithParent = function fromSpecWithParent (parentMatrix, spec, mySize, parentSize, target) {
    target = target ? target : this._matrix;

    // local cache of everything
    var t00         = target[0];
    var t01         = target[1];
    var t02         = target[2];
    var t10         = target[4];
    var t11         = target[5];
    var t12         = target[6];
    var t20         = target[8];
    var t21         = target[9];
    var t22         = target[10];
    var t30         = target[12];
    var t31         = target[13];
    var t32         = target[14];
    var p00         = parentMatrix[0];
    var p01         = parentMatrix[1];
    var p02         = parentMatrix[2];
    var p10         = parentMatrix[4];
    var p11         = parentMatrix[5];
    var p12         = parentMatrix[6];
    var p20         = parentMatrix[8];
    var p21         = parentMatrix[9];
    var p22         = parentMatrix[10];
    var p30         = parentMatrix[12];
    var p31         = parentMatrix[13];
    var p32         = parentMatrix[14];
    var posX        = spec.vectors.position[0];
    var posY        = spec.vectors.position[1];
    var posZ        = spec.vectors.position[2];
    var rotX        = spec.vectors.rotation[0];
    var rotY        = spec.vectors.rotation[1];
    var rotZ        = spec.vectors.rotation[2];
    var rotW        = spec.vectors.rotation[3];
    var scaleX      = spec.vectors.scale[0];
    var scaleY      = spec.vectors.scale[1];
    var scaleZ      = spec.vectors.scale[2];
    var alignX      = spec.offsets.align[0] * parentSize[0];
    var alignY      = spec.offsets.align[1] * parentSize[1];
    var alignZ      = spec.offsets.align[2] * parentSize[2];
    var mountPointX = spec.offsets.mountPoint[0] * mySize[0];
    var mountPointY = spec.offsets.mountPoint[1] * mySize[1];
    var mountPointZ = spec.offsets.mountPoint[2] * mySize[2];
    var originX     = spec.offsets.origin[0] * mySize[0];
    var originY     = spec.offsets.origin[1] * mySize[1];
    var originZ     = spec.offsets.origin[2] * mySize[2];

    var wx = rotW * rotX;
    var wy = rotW * rotY;
    var wz = rotW * rotZ;
    var xx = rotX * rotX;
    var yy = rotY * rotY;
    var zz = rotZ * rotZ;
    var xy = rotX * rotY;
    var xz = rotX * rotZ;
    var yz = rotY * rotZ;

    var rs0 = (1 - 2 * (yy + zz)) * scaleX;
    var rs1 = (2 * (xy + wz)) * scaleX;
    var rs2 = (2 * (xz - wy)) * scaleX;
    var rs3 = (2 * (xy - wz)) * scaleY;
    var rs4 = (1 - 2 * (xx + zz)) * scaleY;
    var rs5 = (2 * (yz + wx)) * scaleY;
    var rs6 = (2 * (xz + wy)) * scaleZ;
    var rs7 = (2 * (yz - wx)) * scaleZ;
    var rs8 = (1 - 2 * (xx + yy)) * scaleZ;

    var tx = alignX + posX - mountPointX + originX - (rs0 * originX + rs3 * originY + rs6 * originZ);
    var ty = alignY + posY - mountPointY + originY - (rs1 * originX + rs4 * originY + rs7 * originZ);
    var tz = alignZ + posZ - mountPointZ + originZ - (rs2 * originX + rs5 * originY + rs8 * originZ);

    target[0] = p00 * rs0 + p10 * rs1 + p20 * rs2;
    target[1] = p01 * rs0 + p11 * rs1 + p21 * rs2;
    target[2] = p02 * rs0 + p12 * rs1 + p22 * rs2;
    target[3] = 0;
    target[4] = p00 * rs3 + p10 * rs4 + p20 * rs5;
    target[5] = p01 * rs3 + p11 * rs4 + p21 * rs5;
    target[6] = p02 * rs3 + p12 * rs4 + p22 * rs5;
    target[7] = 0;
    target[8] = p00 * rs6 + p10 * rs7 + p20 * rs8;
    target[9] = p01 * rs6 + p11 * rs7 + p21 * rs8;
    target[10] = p02 * rs6 + p12 * rs7 + p22 * rs8;
    target[11] = 0;
    target[12] = p00 * tx + p10 * ty + p20 * tz + p30;
    target[13] = p01 * tx + p11 * ty + p21 * tz + p31;
    target[14] = p02 * tx + p12 * ty + p22 * tz + p32;
    target[15] = 1;

    return t00 !== target[0] ||
        t01 !== target[1] ||
        t02 !== target[2] ||
        t10 !== target[4] ||
        t11 !== target[5] ||
        t12 !== target[6] ||
        t20 !== target[8] ||
        t21 !== target[9] ||
        t22 !== target[10] ||
        t30 !== target[12] ||
        t31 !== target[13] ||
        t32 !== target[14];

};

module.exports = Transform;
