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

function RenderContext (dispatch) {
    this._internalSpec = new Spec.Internal();
    this._internalReport = new Spec.Internal.Report();
    this._externalSpec = new Spec.External();
    this._externalReport = new Spec.External.Report();

    this._origin = new Origin(this);
    this._opacity = new Opacity(this);
    this._mountPoint = new MountPoint(this);
    this._align = new Align(this);
    this._transform = new Transform(this);
    this._size = new Size(this);
    this._events = new CallbackStore();
    this._needsReflow = false;
    this._recalcAll = true;
    this._dispatch = dispatch;
    this._noParent = false;
}

RenderContext.prototype.onChange = function onChange (cb) {
    this._events.on(CHANGE, cb);
    return this;
};

RenderContext.prototype.offChange = function offChange (cb) {
    this._events.off(CHANGE, cb);
    return this;
};

RenderContext.prototype.onTransformChange = function onTransformChange (cb) {
    this._events.on(TRANSFORM, cb);
    return this;
};

RenderContext.prototype.offTransformChange = function offTransformChange (cb) {
    this._events.on(TRANSFORM, cb);
    return this;
};

RenderContext.prototype.onSizeChange = function onSizeChange (cb) {
    this._events.on(SIZE, cb);
    return this;
};

RenderContext.prototype.offSizeChange = function offSizeChange (cb) {
    this._events.off(SIZE, cb);
    return this;
};

RenderContext.prototype.onOriginChange = function onOriginChange (cb) {
    this._events.on(ORIGIN, cb);
    return this;
};

RenderContext.prototype.offOriginChange = function offOriginChange (cb) {
    this._events.off(ORIGIN, cb);
    return this;
};

RenderContext.prototype.onOpacityChange = function onOpacityChange (cb) {
    this._events.on(OPACITY, cb);
    return this;
};

RenderContext.prototype.offOpacityChange = function offOpacityChange (cb) {
    this._events.off(OPACITY, cb);
    return this;
};

//

RenderContext.prototype.mount = function mount () {
    this._internalSpec.mounted = true;
};

RenderContext.prototype.dismount = function dismount () {
    this._internalSpec.mounted = false;
};

RenderContext.prototype.setOpacity = function setOpacity (val) {
    if (val > 1) this._internalSpec.opacity = 1;
    else if (val < 0) this._internalSpec.opacity = 0;
    else this._internalSpec.opacity = val;
};

RenderContext.prototype.setAlign = function setAlign (x, y, z) {
    if (!this._internalSpec.location.align)
        this._internalSpec.location.align = [0, 0, 0];
    if (x != null) {
        if (x > 1) this._internalSpec.location.align[0] = 1;
        else if (x < 0) this._internalSpec.location.align[0] = 0;
        else this._internalSpec.location.align[0] = x;
    }
    if (y != null) {
        if (y > 1) this._internalSpec.location.align[1] = 1;
        else if (y < 0) this._internalSpec.location.align[1] = 0;
        else this._internalSpec.location.align[1] = y;
    }
    if (z != null) {
        if (z > 1) this._internalSpec.location.align[2] = 1;
        else if (z < 0) this._internalSpec.location.align[2] = 0;
        else this._internalSpec.location.align[2] = z;
    }
};

RenderContext.prototype.setMountPoint = function setMountPoint (x, y, z) {
    if (!this._internalSpec.location.mountPoint) 
        this._internalSpec.location.mountPoint = [0, 0, 0];
    if (x != null) {
        if (x > 1) this._internalSpec.location.mountPoint[0] = 1;
        else if (x < 0) this._internalSpec.location.mountPoint[0] = 0;
        else this._internalSpec.location.mountPoint[0] = x;
    }
    if (y != null) {
        if (y > 1) this._internalSpec.location.mountPoint[1] = 1;
        else if (y < 0) this._internalSpec.location.mountPoint[1] = 0;
        else this._internalSpec.location.mountPoint[1] = y;
    }
    if (z != null) {
        if (z > 1) this._internalSpec.location.mountPoint[2] = 1;
        else if (z < 0) this._internalSpec.location.mountPoint[2] = 0;
        else this._internalSpec.location.mountPoint[2] = z;
    }
};

RenderContext.prototype.setPosition = function setPosition (x, y, z) {
    if (x != null) this._internalSpec.location.position[0] = x;
    if (y != null) this._internalSpec.location.position[1] = y;
    if (z != null) this._internalSpec.location.position[2] = z;
};

RenderContext.prototype.setRotation = function setRotation (x, y, z) {
    if (x != null) this._internalSpec.location.rotation[0] = x;
    if (y != null) this._internalSpec.location.rotation[1] = y;
    if (z != null) this._internalSpec.location.rotation[2] = z;
};

RenderContext.prototype.setScale = function setScale (x, y, z) {
    if (x != null) this._internalSpec.location.scale[0] = x;
    if (y != null) this._internalSpec.location.scale[1] = y;
    if (z != null) this._internalSpec.location.scale[2] = z;
};

RenderContext.prototype.setProportionalSize = function setProportionalSize (x, y, z) {
    if (x != null) {
        if (x > 1) this._internalSpec.size.proportional[0] = 1;
        else if (x < 0) this._internalSpec.size.proportional[0] = 0;
        else this._internalSpec.size.proportional[0] = x;
    }
    if (y != null) {
        if (y > 1) this._internalSpec.size.proportional[1] = 1;
        else if (y < 0) this._internalSpec.size.proportional[1] = 0;
        else this._internalSpec.size.proportional[1] = y;
    }
    if (z != null) {
        if (z > 1) this._internalSpec.size.proportional[2] = 1;
        else if (z < 0) this._internalSpec.size.proportional[2] = 0;
        else this._internalSpec.size.proportional[2] = z;
    }
};

RenderContext.prototype.setDifferentialSize = function setDifferentialSize (x, y, z) {
    if (x != null) this._internalSpec.size.differential[0] = x;
    if (y != null) this._internalSpec.size.differential[1] = y;
    if (z != null) this._internalSpec.size.differential[2] = z;
};

RenderContext.prototype.setAbsoluteSize = function setAbsoluteSize (x, y, z) {
    if (x != null) this._internalSpec.size.absolute[0] = x;
    if (y != null) this._internalSpec.size.absolute[1] = y;
    if (z != null) this._internalSpec.size.absolute[2] = z;
};

RenderContext.prototype.setOpacity = function setOpacity (opacity) {
    this._opacity.set(opacity);
    return this;
};

RenderContext.prototype.setPosition = function setPosition (x, y, z) {
    this._transform.setTranslation(x, y, z);
    return this;
};

RenderContext.prototype.setAbsolute = function setAbsolute (x, y, z) {
    this._size.setAbsolute(x, y, z);
    return this;
};

RenderContext.prototype.getSize = function getSize () {
    return this._size.get();
};

RenderContext.prototype.setProportions = function setProportions (x, y, z) {
    this._size.setProportions(x, y, z);
    return this;
};

RenderContext.prototype.setDifferential = function setDifferentials (x, y, z) {
    this._size.setDifferential(x, y, z);
    return this;
};

RenderContext.prototype.setRotation = function setRotation (x, y, z) {
    this._transform.setRotation(x, y, z);
    return this;
};

RenderContext.prototype.setScale = function setScale (x, y, z) {
    this._transform.setScale(x, y, z);
    return this;
};

RenderContext.prototype.setAlign = function setAlign (x, y, z) {
    this._align.set(x, y, z);
    return this;
};

RenderContext.prototype.setOrigin = function setOrigin (x, y, z) {
    this._origin.set(x, y, z);
    return this;
};

RenderContext.prototype.setMountPoint = function setMountPoint (x, y, z) {
    this._mountPoint.set(x, y, z);
    return this;
};

RenderContext.prototype.dirty = function dirty () {
    this._recalcAll = true;
    return this;
};

var identSize = new Float32Array([0, 0, 0]);
var identTrans = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

RenderContext.prototype.update = function update (parentContext) {




    var sizeInvalidations;

    if (this._recalcAll || (!this._noParent && !parentContext)) {
        sizeInvalidations = 7;
    } else if (this._noParent && !parentContext) {
        sizeInvalidations = 0;
    } else {
        sizeInvalidations = parentContext._size._previouslyInvalidated;
    }

    this._size._update(
        sizeInvalidations,
        parentContext ? parentContext._size.getTopDownSize() : identSize
    );

    if (!this._origin.isActive) 
        this._origin._setWithoutActivating(
            parentContext ? parentContext._origin.x : 0,
            parentContext ? parentContext._origin.y : 0,
            parentContext ? parentContext._origin.z : 0);
    var mySize = this._size.get();
    var parentSize = parentContext ? parentContext._size.get() : identSize;
    this._align.update(parentSize);
    this._mountPoint.update(mySize);

    var alignInvalidations;

    if (this._recalcAll || (!this._noParent && !parentContext)) {
        alignInvalidations = (1 << 16) - 1;
    } else if (this._noParent && !parentContext) {
        alignInvalidations = 0;
    } else {
        alignInvalidations = parentContext._transform._previouslyInvalidated;
    }

    this._align.transform._update(
        alignInvalidations,
        parentContext ? parentContext._transform._matrix : identTrans
    );

    this._mountPoint.transform._update(
        this._align.transform._previouslyInvalidated,
        this._align.transform._matrix
    );

    this._transform._update(
        this._mountPoint.transform._previouslyInvalidated,
        this._mountPoint.transform._matrix
    );

    if (this._transform._previouslyInvalidated)
       this._events.trigger(TRANSFORM, this._transform);

    if (this._origin.dirty) {
        this._events.trigger(ORIGIN, this._origin);
        this._origin.clean();
    }

    if (this._size._previouslyInvalidated)
        this._events.trigger(SIZE, this._size);

    if (this._opacity.dirty) {
        this._events.trigger(OPACITY, this._opacity);
        this._opacity.clean();
    }

    if (this._recalcAll) this._recalcAll = false;
    if (!parentContext) this._noParent = true;

    return this;
};



function update (parentReport, parentContext) {
    var parentMountChanged = parentMountState(parentReport);
    if (parentMountChanged)


}


module.exports = RenderContext;
