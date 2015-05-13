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

var PathUtils = require('./Path');
var Transform = require('./Transform');
var Dispatch = require('./Dispatch');

/**
 * The transform class is responsible for calculating the transform of a particular
 * node from the data on the node and its parent
 *
 * @constructor {TransformSystem}
 */
function TransformSystem () {
    this._requestingUpdate = false;
    this._transforms = [];
    this._paths = [];
}

/**
 * Internal method to request an update for the transform system.
 *
 * @method _requestUpdate
 * @protected
 */
TransformSystem.prototype._requestUpdate = function _requestUpdate () {
    if (!this._requestingUpdate) {
        this._requestingUpdate = true;
    }
};

/**
 * registers a new Transform for the given path. This transform will be updated
 * when the TransformSystem updates.
 *
 * @method registerTransformAtPath
 * @return {void}
 *
 * @param {String} path for the transform to be registered to.
 */
TransformSystem.prototype.registerTransformAtPath = function registerTransformAtPath (path) {
    var paths = this._paths;
    var index = paths.indexOf(path);
    if (index !== -1) return;

    var i = 0;
    var targetDepth = PathUtils.depth(path);
    var targetIndex = PathUtils.index(path);

    while (
            paths[i] &&
            targetDepth <= PathUtils.depth(paths[i]) &&
            targetIndex < PathUtils.index(paths[i])
    ) i++;
    paths.splice(i, 0, path);
    var newTransform = new Transform();
    newTransform.setParent(this._transforms[paths.indexOf(PathUtils.parent(path))]);
    this._transforms.splice(i, 0, newTransform);
    if (!this._requestingUpdate) this._requestUpdate();
};

/**
 * deregisters a transform registered at the given path.
 *
 * @method deregisterTransformAtPath
 * @return {void}
 *
 * @param {String} path at which to register the transform
 */
TransformSystem.prototype.deregisterTransformAtPath = function deregisterTransformAtPath (path) {
    var paths = this._paths;
    var index = paths.indexOf(path);
    if (index === -1) throw new Error('No transform Registered at path: ' + path);

    this._transforms.splice(index, 1)[0].reset();
    this._paths.splice(index, 1);
};


TransformSystem.prototype.makeBreakPointAt = function makeBreakPointAt (path) {
    var paths = this._paths;
    var index = paths.indexOf(path);
    if (index === -1) throw new Error('No transform Registered at path: ' + path);

    var transform = this._transforms[index];
    transform.setBreakPoint();
};



TransformSystem.prototype.get = function get (path) {
    return this._transforms[this._paths.indexOf(path)];
};

/**
 * Notifies the transform system that the a node's information has changed.
 *
 * @method update
 * @return {void}
 */
TransformSystem.prototype.update = function update () {
    if (!this._requestingUpdate) this._requestUpdate();
};

/**
 * onUpdate is called when the transform system requires an update.
 * It traverses the transform array and evaluates the necessary transforms
 * in the scene graph with the information from the corresponding node
 * in the scene graph
 *
 * @method onUpdate
 */
TransformSystem.prototype.onUpdate = function onUpdate () {
    var transforms = this._transforms;
    var paths = this._paths;
    var transform;
    var changed;
    var node;

    for (var i = 0, len = transforms.length ; i < len ; i++) {
        node = Dispatch.getNode(paths[i]);
        if (!node) continue;
        transform = transforms[i];
        if (transform.from(node) && node.onTransformChange)
            node.onTransformChange(transform);
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
TransformSystem.prototype.fromSpec = function fromSpec (spec, mySize, parentSize, target) {
    target = target ? target : this._matrix;
    var changed = target ? false : true;

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
    target[15] = 0;

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
 * @param {Array} the parent matrix
 * @param {Node.Spec} the target node's spec
 * @param {Array} the size of the node
 * @param {Array} the size of the parent
 * @param {Array} the target array to write the resulting transform to
 *
 * @return {Boolean} whether or not the transform changed
 */
TransformSystem.prototype.fromSpecWithParent = function fromSpecWithParent (parentMatrix, spec, mySize, parentSize, target) {
    target = target ? target : this._matrix;
    var changed = target ? false : true;

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

module.exports = new TransformSystem();
