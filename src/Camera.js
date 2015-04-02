'use strict';

/**
 * @class Camera
 * @constructor
 * @component
 * @param {RenderNode} RenderNode to which the instance of Camera will be a component of
 */
function Camera(dispatch) {
    this._dispatch = dispatch;
    this._projectionType = Camera.ORTHOGRAPHIC_PROJECTION;
    this._focalDepth = 0;
    this._near = 0;
    this._far = 0;
    this._id = dispatch.addComponent(this);
    this._viewTransform = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

    dispatch.onTransformChange(buildViewTransform.bind(this));

    this.setFlat();
}

Camera.FRUSTUM_PROJECTION = 0;
Camera.PINHOLE_PROJECTION = 1;
Camera.ORTHOGRAPHIC_PROJECTION = 2;

// Return the name of the Element Class: 'Camera'
Camera.toString = function toString() {
    return 'Camera';
};

Camera.prototype.getState = function getState() {
    return {
        component: this.constructor.toString(),
        projectionType: this._projectionType,
        focalDepth: this._focalDepth,
        near: this._near,
        far: this._far
    };
};


Camera.prototype.setState = function setState(state) {
    this._dispatch.dirtyComponent(this._id);
    if (state.component === this.constructor.toString()) {
        this.set(state.projectionType, state.focalDepth, state.near, state.far);
        return true;
    }
    return false;
};

Camera.prototype.set = function set(type, depth, near, far) {
    this._dispatch.dirtyComponent(this._id);
    this._projectionType = type;
    this._focalDepth = depth;
    this._near = near;
    this._far = far;
};

Camera.prototype.setDepth = function setDepth(depth) {
    this._dispatch.dirtyComponent(this._id);
    this._projectionType = Camera.PINHOLE_PROJECTION;
    this._focalDepth = depth;
    this._near = 0;
    this._far = 0;

    return this;
};

Camera.prototype.setFrustum = function setFrustum(near, far) {
    this._dispatch.dirtyComponent(this._id);
    this._projectionType = Camera.FRUSTUM_PROJECTION;
    this._focalDepth = 0;
    this._near = near;
    this._far = far;

    return this;
};

Camera.prototype.setFlat = function setFlat() {
    this._dispatch.dirtyComponent(this._id);
    this._projectionType = Camera.ORTHOGRAPHIC_PROJECTION;
    this._focalDepth = 0;
    this._near = 0;
    this._far = 0;

    return this;
};

Camera.prototype.clean = function clean() {
    var path = this._dispatch.getRenderPath();

    this._dispatch
        .sendDrawCommand('WITH')
        .sendDrawCommand(path);

    switch (this._projectionType) {
        case Camera.FRUSTUM_PROJECTION:
            this._dispatch.sendDrawCommand('FRUSTUM_PROJECTION');
            this._dispatch.sendDrawCommand(this._near);
            this._dispatch.sendDrawCommand(this._far);
            break;
        case Camera.PINHOLE_PROJECTION:
            this._dispatch.sendDrawCommand('PINHOLE_PROJECTION');
            this._dispatch.sendDrawCommand(this._focalDepth);
            break;
        case Camera.ORTHOGRAPHIC_PROJECTION:
            this._dispatch.sendDrawCommand('ORTHOGRAPHIC_PROJECTION');
            break;
    }

    if (this._viewDirty) {
        this._viewDirty = false;
        
        this._dispatch.sendDrawCommand('CHANGE_VIEW_TRANSFORM');
        this._dispatch.sendDrawCommand(this._viewTransform[0]);
        this._dispatch.sendDrawCommand(this._viewTransform[1]);
        this._dispatch.sendDrawCommand(this._viewTransform[2]);
        this._dispatch.sendDrawCommand(this._viewTransform[3]);

        this._dispatch.sendDrawCommand(this._viewTransform[4]);
        this._dispatch.sendDrawCommand(this._viewTransform[5]);
        this._dispatch.sendDrawCommand(this._viewTransform[6]);
        this._dispatch.sendDrawCommand(this._viewTransform[7]);

        this._dispatch.sendDrawCommand(this._viewTransform[8]);
        this._dispatch.sendDrawCommand(this._viewTransform[9]);
        this._dispatch.sendDrawCommand(this._viewTransform[10]);
        this._dispatch.sendDrawCommand(this._viewTransform[11]);

        this._dispatch.sendDrawCommand(this._viewTransform[12]);
        this._dispatch.sendDrawCommand(this._viewTransform[13]);
        this._dispatch.sendDrawCommand(this._viewTransform[14]);
        this._dispatch.sendDrawCommand(this._viewTransform[15]);
    }
    return false;
};


function buildViewTransform(transform) {
    var a = transform._matrix;
    this._viewDirty = true;
    this._dispatch.dirtyComponent(this._id);

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
}

module.exports = Camera;
