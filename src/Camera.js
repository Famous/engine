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
    this._id = dispatch.addComponent(this);

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
        focalDepth: this._focalDepth
    };
};


Camera.prototype.setState = function setState(state) {
    this._dispatch.dirtyComponent(this._id);
    if (state.component === this.constructor.toString()) {
        this.set(state.projectionType, state.focalDepth);
        return true;
    }
    return false;
};

Camera.prototype.set = function set(type, depth) {
    this._dispatch.dirtyComponent(this._id);
    this._projectionType = type;
    this._focalDepth = depth;
};

Camera.prototype.setDepth = function setDepth(depth) {
    this._dispatch.dirtyComponent(this._id);
    this._projectionType = Camera.PINHOLE_PROJECTION;
    this._focalDepth = depth;

    return this;
};

Camera.prototype.setFlat = function setFlat() {
    this._dispatch.dirtyComponent(this._id);
    this._projectionType = Camera.ORTHOGRAPHIC_PROJECTION;
    this._focalDepth = 0;

    return this;
};

Camera.prototype.clean = function clean() {
    switch (this._projectionType) {
        case Camera.FRUSTUM_PROJECTION:
            this._dispatch.sendDrawCommand('FRUSTUM_PROJECTION');
            break;
        case Camera.PINHOLE_PROJECTION:
            this._dispatch.sendDrawCommand('PINHOLE_PROJECTION');
            this._dispatch.sendDrawCommand(this._focalDepth);
            break;
        case Camera.ORTHOGRAPHIC_PROJECTION:
            this._dispatch.sendDrawCommand('ORTHOGRAPHIC_PROJECTION');
            break;
    }
    return false;
};

module.exports = Camera;
