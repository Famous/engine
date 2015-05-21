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

var pathUtils = require('./Path');

/**
 * The transform class is responsible for calculating the transform of a particular
 * node from the data on the node and its parent
 *
 * @constructor Transform
 */
function Transform () {
    this.local = new Float32Array(Transform.IDENT);
    this.global = new Float32Array(Transform.IDENT);
    this.needsUpdate = false;
    this.parent = null;
    this.breakPoint = false;
    this.world = false;
}

Transform.IDENT = [ 1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1 ];

Transform.prototype.reset = function reset () {
    this.needsUpdate = false;
    this.parent = null;
    this.breakPoint = false;
};

Transform.prototype.setParent = function setParent (parent) {
    this.parent = parent;
};

Transform.prototype.getParent = function getParent () {
    return this.parent;
};

Transform.prototype.setDirty = function setDirty () {
    this.needsUpdate = true;
};

Transform.prototype.isDirty = function isDirty () {
    return this.needsUpdate;
};

Transform.prototype.setBreakPoint = function setBreakPoint () {
    this.breakPoint = true;
};

Transform.prototype.isBreakPoint = function isBreakPoint () {
    return this.breakPoint;
};

Transform.prototype.getLocalTransform = function getLocalTransform () {
    return this.local;
};

Transform.prototype.getWorldTransform = function getWorldTransform () {
    if (!this.isBreakPoint())
        throw new Error('This transform is not calculating world transforms');
    return this.global;
};

Transform.prototype.from = function from (node) {
    if (!this.parent || this.parent.isBreakPoint())
        return this.fromNode(node);
    else return this.fromNodeWithParent(node);
};

Transform.prototype.calculateWorldMatrix = function calculateWorldMatrix () {
    var nearestBreakPoint = this.parent;

    while (nearestBreakPoint && !nearestBreakPoint.isBreakPoint())
        nearestBreakPoint = nearestBreakPoint.parent;

    if (nearestBreakPoint) return multiply(this.global, nearestBreakPoint, this.local);
    else {
        for (var i = 0; i < 16 ; i++) this.global[i] = this.local[i];
        return false;
    }
};


/**
 * Creates a transformation matrix from a Node's spec.
 *
 * @method fromSpec
 *
 * @param {Node.Spec} spec of the node
 * @param {Array} size of the node
 * @param {Array} size of the node's parent
 * @param {Array} target array to write the matrix to
 *
 * @return {Boolean} whether or not the target array was changed
 */
Transform.prototype.fromNode = function fromNode (node) {
    var target = this.getLocalTransform();
    var mySize = node.getSize();
    var spec = node.value;
    var parentSize = node.getParent().getSize();
    var changed = false;

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

    target[0] = (1 - 2 * (yy + zz)) * scaleX;
    target[1] = (2 * (xy + wz)) * scaleX;
    target[2] = (2 * (xz - wy)) * scaleX;
    target[3] = 0;
    target[4] = (2 * (xy - wz)) * scaleY;
    target[5] = (1 - 2 * (xx + zz)) * scaleY;
    target[6] = (2 * (yz + wx)) * scaleY;
    target[7] = 0;
    target[8] = (2 * (xz + wy)) * scaleZ;
    target[9] = (2 * (yz - wx)) * scaleZ;
    target[10] = (1 - 2 * (xx + yy)) * scaleZ;
    target[11] = 0;
    target[12] = alignX + posX - mountPointX + originX -
                 (target[0] * originX + target[4] * originY + target[8] * originZ);
    target[13] = alignY + posY - mountPointY + originY -
                 (target[1] * originX + target[5] * originY + target[9] * originZ);
    target[14] = alignZ + posZ - mountPointZ + originZ -
                 (target[2] * originX + target[6] * originY + target[10] * originZ);
    target[15] = 1;

    if (this.isBreakPoint()) changed = this.calculateWorldMatrix();

    return changed ||
        t00 !== target[0] ||
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

/**
 * Uses the parent transform, the node's spec, the node's size, and the parent's size
 * to calculate a final transform for the node. Returns true if the transform has changed.
 *
 *
 * @return {Boolean} whether or not the transform changed
 */
Transform.prototype.fromNodeWithParent = function fromNodeWithParent (node) {
    var target = this.getLocalTransform();
    var parentMatrix = this.parent.getLocalTransform();
    var mySize = node.getSize();
    var spec = node.value;
    var parentSize = node.getParent().getSize();
    var changed = false;

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

    if (this.isBreakPoint()) changed = this.calculateWorldMatrix();

    return changed ||
        t00 !== target[0] ||
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

function multiply (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[4], a11 = a[5], a12 = a[6],
        a20 = a[8], a21 = a[9], a22 = a[10],
        a30 = a[12], a31 = a[13], a32 = a[14];

    var changed = false;
    var res;

    // Cache only the current line of the second matrix
    var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];

    res = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    changed = changed ? changed : out[0] === res;
    out[0] = res;

    res = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    changed = changed ? changed : out[1] === res;
    out[1] = res;

    res = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    changed = changed ? changed : out[2] === res;
    out[2] = res;

    out[3] = 0;

    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];

    res = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    changed = changed ? changed : out[4] === res;
    out[4] = res;

    res = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    changed = changed ? changed : out[5] === res;
    out[5] = res;

    res = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    changed = changed ? changed : out[6] === res;
    out[6] = res;

    out[7] = 0;

    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];

    res = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    changed = changed ? changed : out[8] === res;
    out[8] = res;

    res = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    changed = changed ? changed : out[9] === res;
    out[9] = res;

    res = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    changed = changed ? changed : out[10] === res;
    out[10] = res;

    out[11] = 0;

    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];

    res = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    changed = changed ? changed : out[12] === res;
    out[12] = res;

    res = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    changed = changed ? changed : out[13] === res;
    out[13] = res;

    res = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    changed = changed ? changed : out[14] === res;
    out[14] = res;

    out[15] = 1;

    return changed;
}

module.exports = Transform;
