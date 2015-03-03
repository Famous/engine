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
    this._projectionTransform = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
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
        projectionTransform: this._projectionTransform
    };
};


Camera.prototype.setState = function setState(state) {
    if (state.component === this.constructor.toString()) {
        this.set(state.projectionType, state.projectionTransform);
        return true;
    }
    return false;
};

Camera.prototype.set = function set(type, transform) {
    this._projectionType = type;
    this._projectionTransform = transform;
};

Camera.prototype.setDepth = function setDepth(depth) {
    this._projectionType = Camera.PINHOLE_PROJECTION;
    this._projectionTransform[11] = -1/depth;

    return this;
};

Camera.prototype.setFlat = function setFlat() {
    this._projectionType = Camera.ORTHOGRAPHIC_PROJECTION;
    this._projectionTransform[11] = 0;

    return this;
};

module.exports = Camera;
