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
 * Camera is a component that is responsible for sending information to the renderer about where
 * the camera is in the scene.  This allows the user to set the type of projection, the focal depth,
 * and other properties to adjust the way the scenes are rendered.
 *
 * @class Camera
 *
 * @param {Node} node to which the instance of Camera will be a component of
 */
function Camera(node) {
    this._node = node;
    this._projectionType = Camera.ORTHOGRAPHIC_PROJECTION;
    this._focalDepth = 0;
    this._near = 0;
    this._far = 0;
    this._requestingUpdate = false;
    this._id = node.addComponent(this);
    this._viewTransform = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    this._viewDirty = false;
    this._perspectiveDirty = false;
    this.setFlat();
}

Camera.FRUSTUM_PROJECTION = 0;
Camera.PINHOLE_PROJECTION = 1;
Camera.ORTHOGRAPHIC_PROJECTION = 2;

/**
 * @method
 *
 * @return {String} Name of the component
 */
Camera.prototype.toString = function toString() {
    return 'Camera';
};

/**
 * Gets object containing serialized data for the component
 *
 * @method
 *
 * @return {Object} the state of the component
 */
Camera.prototype.getValue = function getValue() {
    return {
        component: this.toString(),
        projectionType: this._projectionType,
        focalDepth: this._focalDepth,
        near: this._near,
        far: this._far
    };
};

/**
 * Set the components state based on some serialized data
 *
 * @method
 *
 * @param {Object} state an object defining what the state of the component should be
 *
 * @return {Boolean} status of the set
 */
Camera.prototype.setValue = function setValue(state) {
    if (this.toString() === state.component) {
        this.set(state.projectionType, state.focalDepth, state.near, state.far);
        return true;
    }
    return false;
};

/**
 * Set the internals of the component
 *
 * @method
 *
 * @param {Number} type an id corresponding to the type of projection to use
 * @param {Number} depth the depth for the pinhole projection model
 * @param {Number} near the distance of the near clipping plane for a frustum projection
 * @param {Number} far the distance of the far clipping plane for a frustum projection
 *
 * @return {Boolean} status of the set
 */
Camera.prototype.set = function set(type, depth, near, far) {
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }
    this._projectionType = type;
    this._focalDepth = depth;
    this._near = near;
    this._far = far;
};

/**
 * Set the camera depth for a pinhole projection model
 *
 * @method
 *
 * @param {Number} depth the distance between the Camera and the origin
 *
 * @return {Camera} this
 */
Camera.prototype.setDepth = function setDepth(depth) {
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }
    this._perspectiveDirty = true;
    this._projectionType = Camera.PINHOLE_PROJECTION;
    this._focalDepth = depth;
    this._near = 0;
    this._far = 0;

    return this;
};

/**
 * Gets object containing serialized data for the component
 *
 * @method
 *
 * @param {Number} near distance from the near clipping plane to the camera
 * @param {Number} far distance from the far clipping plane to the camera
 *
 * @return {Camera} this
 */
Camera.prototype.setFrustum = function setFrustum(near, far) {
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }

    this._perspectiveDirty = true;
    this._projectionType = Camera.FRUSTUM_PROJECTION;
    this._focalDepth = 0;
    this._near = near;
    this._far = far;

    return this;
};

/**
 * Set the Camera to have orthographic projection
 *
 * @method
 *
 * @return {Camera} this
 */
Camera.prototype.setFlat = function setFlat() {
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }

    this._perspectiveDirty = true;
    this._projectionType = Camera.ORTHOGRAPHIC_PROJECTION;
    this._focalDepth = 0;
    this._near = 0;
    this._far = 0;

    return this;
};

/**
 * When the node this component is attached to updates, the Camera will
 * send new camera information to the Compositor to update the rendering
 * of the scene.
 *
 * @method
 *
 * @return {undefined} undefined
 */
Camera.prototype.onUpdate = function onUpdate() {
    this._requestingUpdate = false;

    var path = this._node.getLocation();

    this._node
        .sendDrawCommand('WITH')
        .sendDrawCommand(path);

    if (this._perspectiveDirty) {
        this._perspectiveDirty = false;

        switch (this._projectionType) {
            case Camera.FRUSTUM_PROJECTION:
                this._node.sendDrawCommand('FRUSTUM_PROJECTION');
                this._node.sendDrawCommand(this._near);
                this._node.sendDrawCommand(this._far);
                break;
            case Camera.PINHOLE_PROJECTION:
                this._node.sendDrawCommand('PINHOLE_PROJECTION');
                this._node.sendDrawCommand(this._focalDepth);
                break;
            case Camera.ORTHOGRAPHIC_PROJECTION:
                this._node.sendDrawCommand('ORTHOGRAPHIC_PROJECTION');
                break;
        }
    }

    if (this._viewDirty) {
        this._viewDirty = false;

        this._node.sendDrawCommand('CHANGE_VIEW_TRANSFORM');
        this._node.sendDrawCommand(this._viewTransform[0]);
        this._node.sendDrawCommand(this._viewTransform[1]);
        this._node.sendDrawCommand(this._viewTransform[2]);
        this._node.sendDrawCommand(this._viewTransform[3]);

        this._node.sendDrawCommand(this._viewTransform[4]);
        this._node.sendDrawCommand(this._viewTransform[5]);
        this._node.sendDrawCommand(this._viewTransform[6]);
        this._node.sendDrawCommand(this._viewTransform[7]);

        this._node.sendDrawCommand(this._viewTransform[8]);
        this._node.sendDrawCommand(this._viewTransform[9]);
        this._node.sendDrawCommand(this._viewTransform[10]);
        this._node.sendDrawCommand(this._viewTransform[11]);

        this._node.sendDrawCommand(this._viewTransform[12]);
        this._node.sendDrawCommand(this._viewTransform[13]);
        this._node.sendDrawCommand(this._viewTransform[14]);
        this._node.sendDrawCommand(this._viewTransform[15]);
    }
};

/**
 * When the transform of the node this component is attached to
 * changes, have the Camera update its projection matrix and
 * if needed, flag to node to update.
 *
 * @method
 *
 * @param {Array} transform an array denoting the transform matrix of the node
 *
 * @return {Camera} this
 */
Camera.prototype.onTransformChange = function onTransformChange(transform) {
    var a = transform;
    this._viewDirty = true;

    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }

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

    det = 1/(b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);

    this._viewTransform[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    this._viewTransform[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    this._viewTransform[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    this._viewTransform[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    this._viewTransform[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    this._viewTransform[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    this._viewTransform[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    this._viewTransform[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    this._viewTransform[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    this._viewTransform[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    this._viewTransform[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    this._viewTransform[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    this._viewTransform[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    this._viewTransform[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    this._viewTransform[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    this._viewTransform[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
};

module.exports = Camera;
