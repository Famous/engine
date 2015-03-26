'use strict';

var Transform = require('./Transform');
var Origin = require('./Origin');
var MountPoint = require('./MountPoint');
var Align = require('./Align');
var Opacity = require('./Opacity');
var CallbackStore = require('famous-utilities').CallbackStore;
var Size = require('./Size');

var Spec = require('./RenderSpec');

var CHANGE = 'change';
var TRANSFORM = 'transform';
var SIZE = 'size';
var ORIGIN = 'origin';
var OPACITY = 'opacity';

/**
 * A RenderContext does not have a notion of a nested scene graph hierarchy.
 * Its sole purpose it to manage the `origin`, `opacity`, `mountPoint`,
 * `align` and `size` primitives primitives by updating its internal transform
 * matrix.
 *
 * The RenderContext is being created by a LocalDisaptch, which delegates to
 * the RenderContext's update method on every `FRAME` in order to apply
 * corresponding updates to the transform matrix attached to the node and all
 * its children. While the scene graph is being traversed recursively, the RenderContext
 * does not have a notion of children. Instead, the Node recursively updates
 * its LocalDispatch (and therefore its RenderContext) and all its children.
 * 
 * @class RenderContext
 * @constructor
 * @private
 * 
 * @param {LocalDisaptch} dispatch
 */
function RenderContext (dispatch) {

    this._id = dispatch.registerComponent(this);
    this._dispatch = dispatch;
    this._requestingUpdate = false;

    this._previousInternalSpec = new Spec.Internal();
    this._internalSpec = new Spec.Internal();
    this._internalReport = new Spec.Internal.Report();
    this._previousExternalSpec = new Spec.External();
    this._externalSpec = new Spec.External();
    this._externalReport = new Spec.External.Report();

}

RenderContext.prototype._requestUpdate = function _requestUpdate () {
    if (!this._requestingUpdate) this._dispatch.requestUpdate(this._id);
    this._requestingUpdate = true;
};

RenderContext.prototype._updateInternalSpec = function _updateInternalSpec (diff, dispatch, currentFrame) {
    if (diff.getMountStateComponent()) dispatch.mountStateChanged(currentFrame.mounted);
    if (diff.getShowStateComponent()) dispatch.showStateChanged(currentFrame.shown);
    if (diff.getOpacityComponent()) dispatch.opacityChanged(currentFrame.opacity);

    var report = diff.getAlignComponent();
    var vec = currentFrame.location.align;
    if (report) dispatch.alignChanged(report, vec[0], vec[1], vec[2]);

    report = diff.getMountPointComponent();
    vec = currentFrame.location.mountPoint;
    if (report) dispatch.mountPointChanged(report, vec[0], vec[1], vec[2]);

    report = diff.getOriginComponent();
    vec = currentFrame.location.origin;
    if (report) dispatch.originChanged(report, vec[0], vec[1], vec[2]);

    report = diff.getPositionComponent();
    vec = currentFrame.location.position;
    if (report) dispatch.positionChanged(report, vec[0], vec[1], vec[2]);

    report = diff.getRotationComponent();
    vec = currentFrame.location.rotation;
    if (report) dispatch.rotationChanged(report, vec[0], vec[1], vec[2]);

    report = diff.getScaleComponent();
    vec = currentFrame.location.scale;
    if (report) dispatch.scaleChanged(report, vec[0], vec[1], vec[2]);

    report = diff.getProportionalSizeComponent();
    vec = currentFrame.size.proportional;
    if (report) dispatch.proportionalSizeChanged(report, vec[0], vec[1], vec[2]);

    report = diff.getDifferentialSizeComponent();
    vec = currentFrame.size.differential;
    if (report) dispatch.differentialSizeChanged(report, vec[0], vec[1], vec[2]);

    report = diff.getAbsoluteSizeComponent();
    vec = currentFrame.size.absolute;
    if (report) dispatch.absoluteSizeChanged(report, vec[0], vec[1], vec[2]);
}

RenderContext.prototype._updateExternalSpec = function _updateExternalSpec (diff, dispatch, currentFrame) {
    var report = diff.getTransformComponent();
    if (report) dispatch.transformChanged(report, currentFrame.transform);
    report = diff.getSizeComponent();
    if (report) dispatch.sizeChanged(report, currentFrame.size);
};

RenderContext.prototype.onMount = function onMount () {
    this._externalSpec.mounted = true;
};

RenderContext.prototype.onDismount = function onDismount () {
    this._externalSpec.mounted = false;
};

RenderContext.prototype.onShow = function onShow () {
    this._externalSpec.shown = true;
};

RenderContext.prototype.onHide = function onHide () {
    this._externalSpec.shown = false;
};

RenderContext.prototype.onUpdate = function onUpdate () {
    var previousFrame = this._previousInternalSpec;
    var currentFrame = this._internalSpec;
    var diff = Spec.Internal.diff(previousFrame, currentFrame, this._internalReport);
    var dispatch = this._dispatch;
    this._updateInternalSpec(diff, dispatch, currentFrame);
    this._previousInternalSpec.set(this._internalSpec, diff);

    previousFrame = this._previousExternalSpec;
    currentFrame = this._externalSpec;
    diff = Spec.External.diff(previousFrame, currentFrame, this._externalReport);
    this._updateExternalSpec(diff, dispatch, currentFrame);
    this._previousExternalSpec.set(this._externalSpec, diff);
    this._requestingUpdate = false;
};

RenderContext.prototype.mount = function mount () {
    if (!this._internalSpec.mounted) {
        this._internalSpec.mounted = true;
        if (!this._requestingUpdate) this._requestUpdate();
    }
    return this;
};

RenderContext.prototype.dismount = function dismount () {
    if (this._internalSpec.mounted) {
        this._internalSpec.mounted = false;
        if (!this._requestingUpdate) this._requestUpdate();
    }
    return this;
};

RenderContext.prototype.show = function show () {
    if (!this._internalSpec.shown) {
        this._internalSpec.shown = true;
        if (!this._requestingUpdate) this._requestUpdate();
    }
    return this;
};

RenderContext.prototype.hide = function hide () {
    if (this._internalSpec.shown) {
        this._internalSpec.shown = false;
        if (!this._requestingUpdate) this._requestUpdate();
    }
    return this;
};

RenderContext.prototype.setOpacity = function setOpacity (val) {
    if (val > 1) val = 1;
    else if (val < 0) val = 0;
    if (val != null && val !== this._internalSpec.opacity) {
        this._internalSpec.opacity = val;
        if (!this._requestingUpdate) this._requestUpdate();
    }
};

RenderContext.prototype.setAlign = function setAlign (x, y, z) {
    var validX = x != null;
    var validY = y != null;
    var validZ = z != null;

    if (!this._internalSpec.location.align && (validX || validY || validZ))
        this._internalSpec.location.align = [0, 0, 0];

    var align = this._internalSpec.location.align;

    if (validX) {

        if (x > 1) x = 1;
        else if (x < 0) x = 0;

        if (x !== align[0]) {
            align[0] = x;
            if (!this._requestingUpdate) this._requestUpdate();
        }

    }

    if (validY) {

        if (y > 1) y = 1;
        else if (y < 0) y = 0;

        if (y !== align[1]) {
            align[1] = y;
            if (!this._requestingUpdate) this._requestUpdate();
        }

    }

    if (validZ) {

        if (z > 1) z = 1;
        else if (z < 0) z = 0;

        if (z !== align[2]) {
            align[2] = z;
            if (!this._requestingUpdate) this._requestUpdate();
        }

    }

};

RenderContext.prototype.setMountPoint = function setMountPoint (x, y, z) {
    var validX = x != null;
    var validY = y != null;
    var validZ = z != null;

    if (!this._internalSpec.location.mountPoint && (validX || validY || validZ))
        this._internalSpec.location.mountPoint = [0, 0, 0];

    var mountPoint = this._internalSpec.location.mountPoint;

    if (validX) {

        if (x > 1) x = 1;
        else if (x < 0) x = 0;

        if (x !== mountPoint[0]) {
            mountPoint[0] = x;
            if (!this._requestingUpdate) this._requestUpdate();
        }

    }

    if (validY) {

        if (y > 1) y = 1;
        else if (y < 0) y = 0;

        if (y !== mountPoint[1]) {
            mountPoint[1] = y;
            if (!this._requestingUpdate) this._requestUpdate();
        }

    }

    if (validZ) {

        if (z > 1) z = 1;
        else if (z < 0) z = 0;

        if (z !== mountPoint[2]) {
            mountPoint[2] = z;
            if (!this._requestingUpdate) this._requestUpdate();
        }

    }
};

RenderContext.prototype.setOrigin = function setOrigin (x, y, z) {
    var origin = this._internalSpec.location.origin;

    if (x != null) {

        if (x > 1) x = 1;
        else if (x < 0) x = 0;

        if (x !== origin[0]) {
            origin[0] = x;
            if (!this._requestingUpdate) this._requestUpdate();
        }

    }

    if (y != null) {

        if (y > 1) y = 1;
        else if (y < 0) y = 0;

        if (y !== origin[1]) {
            origin[1] = y;
            if (!this._requestingUpdate) this._requestUpdate();
        }

    }

    if (z != null) {

        if (z > 1) z = 1;
        else if (z < 0) z = 0;

        if (z !== origin[2]) {
            origin[2] = z;
            if (!this._requestingUpdate) this._requestUpdate();
        }

    }

};

RenderContext.prototype.setPosition = function setPosition (x, y, z) {
    var position = this._internalSpec.location.position;

    if (x != null && x !== position[0]) {
        position[0] = x;
        if (!this._requestingUpdate) this._requestUpdate();
    }

    if (y != null && y !== position[1]) {
        position[1] = y;
        if (!this._requestingUpdate) this._requestUpdate();
    }

    if (z != null && z !== position[2]) {
        position[2] = z;
        if (!this._requestingUpdate) this._requestUpdate();
    }

};

RenderContext.prototype.setRotation = function setRotation (x, y, z) {
    var rotation = this._internalSpec.location.rotation;

    if (x != null && x !== rotation[0]) {
        rotation[0] = x;
        if (!this._requestingUpdate) this._requestUpdate();
    }

    if (y != null && y !== rotation[1]) {
        rotation[1] = y;
        if (!this._requestingUpdate) this._requestUpdate();
    }

    if (z != null && z !== rotation[2]) {
        rotation[2] = z;
        if (!this._requestingUpdate) this._requestUpdate();
    }
};

RenderContext.prototype.setScale = function setScale (x, y, z) {
    var scale = this._internalSpec.location.scale;

    if (x != null && x !== scale[0]) {
        scale[0] = x;
        if (!this._requestingUpdate) this._requestUpdate();
    }

    if (y != null && y !== scale[1]) {
        scale[1] = y;
        if (!this._requestingUpdate) this._requestUpdate();
    }

    if (z != null && z !== scale[2]) {
        scale[2] = z;
        if (!this._requestingUpdate) this._requestUpdate();
    }
};

RenderContext.prototype.setProportionalSize = function setProportionalSize (x, y, z) {
    var proportional = this._internalSpec.size.proportional;

    if (x != null) {

        if (x > 1) x = 1;
        else if (x < 0) x = 0;

        if (x !== proportional[0]) {
            proportional[0] = x;
            if (!this._requestingUpdate) this._requestUpdate();
        }

    }

    if (y != null) {

        if (y > 1) y = 1;
        else if (y < 0) y = 0;

        if (y !== proportional[1]) {
            proportional[1] = y;
            if (!this._requestingUpdate) this._requestUpdate();
        }

    }

    if (z != null) {

        if (z > 1) z = 1;
        else if (z < 0) z = 0;

        if (z !== proportional[2]) {
            proportional[2] = z;
            if (!this._requestingUpdate) this._requestUpdate();
        }

    }

};

RenderContext.prototype.setDifferentialSize = function setDifferentialSize (x, y, z) {
    var differential = this._internalSpec.size.differential;

    if (x != null) {

        if (x > 1) x = 1;
        else if (x < 0) x = 0;

        if (x !== differential[0]) {
            differential[0] = x;
            if (!this._requestingUpdate) this._requestUpdate();
        }

    }

    if (y != null) {

        if (y > 1) y = 1;
        else if (y < 0) y = 0;

        if (y !== differential[1]) {
            differential[1] = y;
            if (!this._requestingUpdate) this._requestUpdate();
        }

    }

    if (z != null) {

        if (z > 1) z = 1;
        else if (z < 0) z = 0;

        if (z !== differential[2]) {
            differential[2] = z;
            if (!this._requestingUpdate) this._requestUpdate();
        }

    }
};

RenderContext.prototype.setAbsoluteSize = function setAbsoluteSize (x, y, z) {
    var absolute = this._internalSpec.size.absolute;

    if (x != null) {

        if (x > 1) x = 1;
        else if (x < 0) x = 0;

        if (x !== absolute[0]) {
            absolute[0] = x;
            if (!this._requestingUpdate) this._requestUpdate();
        }

    }

    if (y != null) {

        if (y > 1) y = 1;
        else if (y < 0) y = 0;

        if (y !== absolute[1]) {
            absolute[1] = y;
            if (!this._requestingUpdate) this._requestUpdate();
        }

    }

    if (z != null) {

        if (z > 1) z = 1;
        else if (z < 0) z = 0;

        if (z !== absolute[2]) {
            absolute[2] = z;
            if (!this._requestingUpdate) this._requestUpdate();
        }

    }
};

// /**
//  * Sets the opacity of the RenderContext.
//  *
//  * @method  setOpacity
//  * @chainable
//  * 
//  * @param {Number} opacity  opacity to be set on the RenderContext
//  * @return {RenderContext}  this
//  */
// RenderContext.prototype.setOpacity = function setOpacity (opacity) {
//     this._opacity.set(opacity);
//     return this;
// };

// /**
//  * Sets the position of the RenderContext.
//  *
//  * @method setPosition
//  * @chainable
//  * 
//  * @param {Number} x        x position
//  * @param {Number} y        y position
//  * @param {Number} z        z position
//  * @return {RenderContext}  this
//  */
// RenderContext.prototype.setPosition = function setPosition (x, y, z) {
//     this._transform.setTranslation(x, y, z);
//     return this;
// };

// /**
//  * Sets the absolute size of the RenderContext.
//  *
//  * @method setAbsolute
//  * @chainable
//  * 
//  * @param {Number} x        absolute allocated pixel space in x direction
//  *                          (absolute width)
//  * @param {Number} y        absolute allocated pixel space in y direction
//  *                          (absolute height)
//  * @param {Number} z        absolute allocated **pixel** space in z direction
//  *                          (absolute depth)
//  * @return {RenderContext}  this
//  */
// RenderContext.prototype.setAbsolute = function setAbsolute (x, y, z) {
//     this._size.setAbsolute(x, y, z);
//     return this;
// };

// /**
//  * Returns the absolute (pixel) size of the RenderContext.
//  *
//  * @method  getSize
//  * @chainable
//  * 
//  * @return {Number[]} 3D absolute **pixel** size
//  */
// RenderContext.prototype.getSize = function getSize () {
//     return this._size.get();
// };

// /**
//  * Sets the proportional size of the RenderContext, relative to its parent.
//  *
//  * @method  setProportions
//  * @chainable
//  * 
//  * @param {Number} x        proportional allocated relative space in x direction (relative width)
//  * @param {Number} y        proportional allocated relative space in y direction (relative height)
//  * @param {Number} z        proportional allocated relative space in z direction (relative depth)
//  * @return {RenderContext}  this
//  */
// RenderContext.prototype.setProportions = function setProportions (x, y, z) {
//     this._size.setProportions(x, y, z);
//     return this;
// };

// /**
//  * Sets the differential size of the RenderContext. Differential sizing enables
//  * adding an additional offset after applying an absolute and proportional size.
//  *
//  * @method  setDifferntial
//  * @chainable
//  * 
//  * @param {Number} x        absolute pixel size to be added in x direction
//  *                          (additional width)
//  * @param {Number} y        absolute pixel size to be added in y direction
//  *                          (additional height)
//  * @param {Number} z        absolute pixel size to be added in z direction
//  *                          (additional depth)
//  * @return {RenderContext}  this
//  */
// RenderContext.prototype.setDifferential = function setDifferentials (x, y, z) {
//     this._size.setDifferential(x, y, z);
//     return this;
// };

// /**
//  * Sets the rotation of the RenderContext in euler angles.
//  *
//  * @method  setRotation
//  * @chainable
//  * 
//  * @param {RenderContext} x     x rotation
//  * @param {RenderContext} y     y rotation
//  * @param {RenderContext} z     z rotation
//  * @return {RenderContext}      this
//  */
// RenderContext.prototype.setRotation = function setRotation (x, y, z) {
//     this._transform.setRotation(x, y, z);
//     return this;
// };

// /**
//  * Sets the three dimensional scale of the RenderContext.
//  *
//  * @method  setScale
//  * @chainable
//  * 
//  * @param {Number} x        x scale
//  * @param {Number} y        y scale
//  * @param {Number} z        z scale
//  * @return {RenderContext}  this 
//  */
// RenderContext.prototype.setScale = function setScale (x, y, z) {
//     this._transform.setScale(x, y, z);
//     return this;
// };

// /**
//  * Sets the align of the RenderContext.
//  *
//  * @method  setAlign
//  * @chainable
//  * 
//  * @param {Number} x        x align
//  * @param {Number} y        y align
//  * @param {Number} z        z align
//  * @return {RenderContext}  this
//  */
// RenderContext.prototype.setAlign = function setAlign (x, y, z) {
//     this._align.set(x, y, z);
//     return this;
// };

// /**
//  * Sets the origin of the RenderContext.
//  *
//  * @method  setOrigin
//  * @chainable
//  * 
//  * @param {Number} x        x origin
//  * @param {Number} y        y origin
//  * @param {Number} z        z origin
//  * @return {RenderContext}  this
//  */
// RenderContext.prototype.setOrigin = function setOrigin (x, y, z) {
//     this._origin.set(x, y, z);
//     return this;
// };

// /**
//  * Sets the mount point of the RenderContext.
//  * TODO Come up with some nice ASCII art
//  *
//  * @method  setMountPoint
//  * @chainable
//  * 
//  * @param {Number} x        mount point in x direction
//  * @param {Number} y        mount point in y direction
//  * @param {Number} z        mount point in z direction
//  * @return {RenderContext}  this
//  */
// RenderContext.prototype.setMountPoint = function setMountPoint (x, y, z) {
//     this._mountPoint.set(x, y, z);
//     return this;
// };

// RenderContext.prototype.dirty = function dirty () {
//     this._recalcAll = true;
//     return this;
// };

// var identSize = new Float32Array([0, 0, 0]);
// var identTrans = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

// /**
//  * Updates the RenderContext's internal transform matrix and emits
//  * corresponding change events. Takes into account the parentContext's size
//  * invalidations in order to maintain high throughput while still updating the
//  * entire scene graph on every FRAME command.
//  * 
//  * @method  update
//  * @chainable
//  * 
//  * @param  {RenderContext} parentContext    parent context passed down recrusively by
//  *                                          the Node through the LocalDispatch
//  * @return {RenderContext}                  this
//  */
// RenderContext.prototype.update = function update (parentContext) {




//     var sizeInvalidations;

//     if (this._recalcAll || (!this._noParent && !parentContext)) {
//         sizeInvalidations = 7;
//     } else if (this._noParent && !parentContext) {
//         sizeInvalidations = 0;
//     } else {
//         sizeInvalidations = parentContext._size._previouslyInvalidated;
//     }

//     this._size._update(
//         sizeInvalidations,
//         parentContext ? parentContext._size.getTopDownSize() : identSize
//     );

//     if (!this._origin.isActive) 
//         this._origin._setWithoutActivating(
//             parentContext ? parentContext._origin.x : 0,
//             parentContext ? parentContext._origin.y : 0,
//             parentContext ? parentContext._origin.z : 0);
//     var mySize = this._size.get();
//     var parentSize = parentContext ? parentContext._size.get() : identSize;
//     this._align.update(parentSize);
//     this._mountPoint.update(mySize);

//     var alignInvalidations;

//     if (this._recalcAll || (!this._noParent && !parentContext)) {
//         alignInvalidations = (1 << 16) - 1;
//     } else if (this._noParent && !parentContext) {
//         alignInvalidations = 0;
//     } else {
//         alignInvalidations = parentContext._transform._previouslyInvalidated;
//     }

//     this._align.transform._update(
//         alignInvalidations,
//         parentContext ? parentContext._transform._matrix : identTrans
//     );

//     this._mountPoint.transform._update(
//         this._align.transform._previouslyInvalidated,
//         this._align.transform._matrix
//     );

//     this._transform._update(
//         this._mountPoint.transform._previouslyInvalidated,
//         this._mountPoint.transform._matrix
//     );

//     if (this._transform._previouslyInvalidated)
//        this._events.trigger(TRANSFORM, this._transform);

//     if (this._origin.dirty) {
//         this._events.trigger(ORIGIN, this._origin);
//         this._origin.clean();
//     }

//     if (this._size._previouslyInvalidated)
//         this._events.trigger(SIZE, this._size);

//     if (this._opacity.dirty) {
//         this._events.trigger(OPACITY, this._opacity);
//         this._opacity.clean();
//     }

//     if (this._recalcAll) this._recalcAll = false;
//     if (!parentContext) this._noParent = true;

//     return this;
// };



// function update (parentReport, parentContext) {
//     var parentMountChanged = parentMountState(parentReport);
//     if (parentMountChanged)


// }


module.exports = RenderContext;
