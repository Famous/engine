'use strict';

var QUARTER_PI = Math.PI * 0.25;

/**
 * @class Camera
 * @constructor
 * @component
 * @param {RenderNode} RenderNode to which the instance of Camera will be a component of
 */
function Camera(owner) {
    this.owner = owner;
    this.spec = {
        projection: null,
        near: 0,
        far: 1000,
        fieldOfView: QUARTER_PI,
        focalDepth: 1000
    };
}

Camera.FRUSTUM_PROJECTION = 0;
Camera.PINHOLE_PROJECTION = 1;
Camera.ORTHOGRAPHIC_PROJECTION = 2;

// Return the name of the Element Class: 'Camera'
Camera.toString = function toString() {
    return 'camera';
};

Camera.prototype.getProjection = function getProjection() {
    return this.spec;
};

Camera.prototype.frustum = function projection(near, far, fieldOfView) {
    this.spec.projection = Camera.FRUSTUM_PROJECTION;

    var cameraOptions = this.spec;

    this.spec.near = cameraOptions.near = near ? near : 0;
    this.spec.far = cameraOptions.far = far ? far : 1000;
    this.spec.fieldOfView = cameraOptions.fieldOfView = fieldOfView ? fieldOfView : QUARTER_PI;

    return this;
};

Camera.prototype.pinhole = function pinhole(focalDepth) {
    this.spec.projection = Camera.PINHOLE_PROJECTION;
    this.spec.focalDepth = focalDepth ? focalDepth : 1000;

    return this;
};

Camera.prototype.orthographic = function orthographic (near, far) {
    this.spec.projection = Camera.ORTHOGRAPHIC_PROJECTION;

    var cameraOptions = this.spec;
    cameraOptions.near = near ? near : 0;
    cameraOptions.far = far ? far : 1000;
    
    return this;
};

Camera.prototype.clear = function clear() {
    this.spec.projection = null;

    var cameraOptions = this.spec;

    cameraOptions.near = 0;
    cameraOptions.far = 1000;
    cameraOptions.fieldOfView = QUARTER_PI;
    cameraOptions.focalDepth = 1000;

    return this;
};

Camera.prototype.isRenderable = function isRenderable() {
    return (this.spec.projection != null);
};

module.exports = Camera;
