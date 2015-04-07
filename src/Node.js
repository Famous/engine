'use strict';

var Transform = require('./Transform');
var Size = require('./Size');
var Famous = require('./Famous');

var TRANSFORM_PROCESSOR = new Transform();
var SIZE_PROCESSOR = new Size();

var IDENT = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
];

var ONES = [1, 1, 1];

function Node () {
    this._calculatedValues = {
        transform: new Float32Array(IDENT),
        size: new Float32Array(3)
    };

    this._requestingUpdate = false;
    this._inUpdate = false;

    this._updateQueue = [];
    this._nextUpdateQueue = [];

    this._freedComponentIndicies = [];
    this._components = [];

    this._freedChildIndicies = [];
    this._children = [];

    this._parent = null;
    this._globalUpdater = null;

    this.value = new Node.Spec();
}

Node.RELATIVE_SIZE = Size.RELATIVE;
Node.ABSOLUTE_SIZE = Size.ABSOLUTE;
Node.RENDER_SIZE = Size.RENDER;
Node.DEFAULT_SIZE = Size.DEFAULT;

Node.Spec = function Spec () {
    this.location = null;
    this.showState = {
        mounted: false,
        shown: false,
        opacity: 1
    };
    this.offsets = {
        mountPoint: new Float32Array(3),
        align: new Float32Array(3),
        origin: new Float32Array(3)
    };
    this.vectors = {
        position: new Float32Array(3),
        rotation: new Float32Array(3),
        scale: new Float32Array(ONES)
    };
    this.size = {
        sizeMode: new Float32Array([Size.RELATIVE, Size.RELATIVE, Size.RELATIVE]),
        proportional: new Float32Array(ONES),
        differential: new Float32Array(3),
        absolute: new Float32Array(3),
        render: new Float32Array(3)
    };
};

Node.prototype.getLocation = function getLocation () {
    return this.value.location;
};

Node.prototype.getId = Node.prototype.getLocation;


// THIS WILL BE DEPRICATED
Node.prototype.sendDrawCommand = function sendDrawCommand (message) {
    Famous.message(message);
    return this;
};

Node.prototype.getValue = function getValue () {
    var numberOfChildren = this._children.length;
    var numberOfComponents = this._components.length;
    var i = 0;

    var value = {
        location: this.value.location,
        spec: this.value,
        components: new Array(numberOfComponents),
        children: new Array(numberOfChildren)
    };

    for (; i < numberOfChildren ; i++)
        value.children[i] = this._children[i].getValue();

    for (i = 0 ; i < numberOfComponents ; i++)
        value.components[i] = this._components[i].getValue();

    return value;
};

Node.prototype.getComputedValue = function getComputedValue () {
    var numberOfChildren = this._children.length;

    var value = {
        location: this.value.location,
        computedValues: this._calculatedValues,
        children: new Array(numberOfChildren)
    };

    for (var i = 0 ; i < numberOfChildren ; i++)
        value.children[i] = this._children[i].getComputedValue();

    return value;
};

Node.prototype.getChildren = function getChildren () {
    return this._children;
};

Node.prototype.getParent = function getParent () {
    return this._parent;
};

Node.prototype.requestUpdate = function requestUpdate (id) {
    if (this._inUpdate) return this.requestUpdateOnNextTick(id);
    this._updateQueue.push(id);
    if (!this._requestingUpdate) this._requestUpdate();
};

Node.prototype.requestUpdateOnNextTick = function requestUpdateOnNextTick (id) {
    this._nextUpdateQueue.push(id);
};

Node.prototype.getUpdater = function getUpdater () {
    return this._globalUpdater;
};

Node.prototype.isMounted = function isMounted () {
    return this.value.showState.mounted;
};

Node.prototype.isShown = function isShown () {
    return this.value.showState.shown;
};

Node.prototype.getOpacity = function getOpacity () {
    return this.value.showState.opacity;
};

Node.prototype.getMountPoint = function getMountPoint () {
    return this.value.offsets.mountPoint;
};

Node.prototype.getAlign = function getAlign () {
    return this.value.offsets.align;
};

Node.prototype.getOrigin = function getOrigin () {
    return this.value.offsets.origin;
};

Node.prototype.getPosition = function getPosition () {
    return this.value.vectors.position;
};

Node.prototype.getRotation = function getRotation () {
    return this.value.vectors.rotation;
};

Node.prototype.getScale = function getScale () {
    return this.value.vectors.scale;
};

Node.prototype.getSizeMode = function getSizeMode () {
    return this.value.size.sizeMode;
};

Node.prototype.getProportionalSize = function getProportionalSize () {
    return this.value.size.proportional;
};

Node.prototype.getDifferentialSize = function getDifferentialSize () {
    return this.value.size.differential;
};

Node.prototype.getAbsoluteSize = function getAbsoluteSize () {
    return this.value.size.absolute;
};

Node.prototype.getRenderSize = function getRenderSize () {
    return this.value.size.render;
};

Node.prototype.getSize = function getSize () {
    return this._calculatedValues.size;
};

Node.prototype.getTransform = function getTransform () {
    return this._calculatedValues.transform;
};

Node.prototype.addChild = function addChild (child) {
    var index = child ? this._children.indexOf(child) : -1;
    child = child ? child : new Node();

    if (index === -1) {
        index = this._freedChildIndicies.length ? this._freedChildIndicies.pop() : this._children.length;
        this._children[index] = child;

        if (this.isMounted() && child.onMount) {
            var myId = this.getId();
            var childId = myId + '/' + index;
            child.onMount(this, childId);
        }

        if (this.isShown() && child.onShow) child.onShow();
    }

    return child;
};

Node.prototype.removeChild = function removeChild (child) {
    var index = this._children.indexOf(child);
    if (index !== -1) {
        this._freedChildIndicies.push(index);
        if (this.isShown() && child.onHide)
            child.onHide();

        if (this.isMounted() && child.onDismount)
            child.onDismount();

        this._children[index] = null;
    }
};

Node.prototype.addComponent = function addComponent (component) {
    var index = this._components.indexOf(component);
    if (index === -1) {
        index = this._freedComponentIndicies.length ? this._freedComponentIndicies.pop() : this._components.length;
        this._components[index] = component;

        if (this.isMounted() && component.onMount)
            component.onMount(this, this.getId() + ':' + index, index);

        if (this.isShown() && component.onShow)
            component.onShow();
    }

    return index;
};

Node.prototype.removeComponent = function removeComponent (component) {
    var index = this._components.indexOf(component);
    if (index !== -1) {
        this._freedComponentIndicies.push(index);
        if (this.isShown() && component.onHide)
            component.onHide();

        if (this.isMounted() && component.onDismount)
            component.onDismount();

        this._components[index] = null;
    }
};

Node.prototype._requestUpdate = function _requestUpdate (force) {
    if (force || (!this._requestingUpdate && this._globalUpdater)) {
        this._globalUpdater.requestUpdate(this);
        this._requestingUpdate = true;
    }
};

Node.prototype._vec3OptionalSet = function _vec3OptionalSet (vec3, index, val) {
    if (val != null && vec3[index] !== val) {
        vec3[index] = val;
        if (!this._requestingUpdate) this._requestUpdate();
        return true;
    }
    return false;
};

Node.prototype.show = function show () {
    var i = 0;
    var items = this._components;
    var len = items.length;
    var item;

    this.value.showState.shown = true;

    for (; i < len ; i++) {
        item = items[i];
        if (item && item.onShow) item.onShow();
    }

    i = 0;
    items = this._children;
    len = items.length;

    for (; i < len ; i++) {
        item = items[i];
        if (item && item.onParentShow) item.onParentShow();
    }
};

Node.prototype.hide = function hide () {
    var i = 0;
    var items = this._components;
    var len = items.length;
    var item;

    this.value.showState.shown = false;

    for (; i < len ; i++) {
        item = items[i];
        if (item && item.onHide) item.onHide();
    }

    i = 0;
    items = this._children;
    len = items.length;

    for (; i < len ; i++) {
        item = items[i];
        if (item && item.onParentHide) item.onParentHide();
    }
};

Node.prototype.setAlign = function setAlign (x, y, z) {
    var vec3 = this.value.offsets.align;
    var propogate = false;

    propogate = this._vec3OptionalSet(vec3, 0, x) || propogate;
    propogate = this._vec3OptionalSet(vec3, 1, y) || propogate;
    propogate = this._vec3OptionalSet(vec3, 2, z) || propogate;

    if (propogate) {
        var i = 0;
        var list = this._components;
        var len = list.length;
        var item;
        x = vec3[0];
        y = vec3[1];
        z = vec3[2];
        for (; i < len ; i++) {
            item = list[i];
            if (item && item.onAlignChange) item.onAlignChange(x, y, z);
        }
    }
};

Node.prototype.setMountPoint = function setMountPoint (x, y, z) {
    var vec3 = this.value.offsets.mountPoint;
    var propogate = false;

    propogate = this._vec3OptionalSet(vec3, 0, x) || propogate;
    propogate = this._vec3OptionalSet(vec3, 1, y) || propogate;
    propogate = this._vec3OptionalSet(vec3, 2, z) || propogate;

    if (propogate) {
        var i = 0;
        var list = this._components;
        var len = list.length;
        var item;
        x = vec3[0];
        y = vec3[1];
        z = vec3[2];
        for (; i < len ; i++) {
            item = list[i];
            if (item && item.onMountPointChange) item.onMountPointChange(x, y, z);
        }
    }
};

Node.prototype.setOrigin = function setOrigin (x, y, z) {
    var vec3 = this.value.offsets.origin;
    var propogate = false;

    propogate = this._vec3OptionalSet(vec3, 0, x) || propogate;
    propogate = this._vec3OptionalSet(vec3, 1, y) || propogate;
    propogate = this._vec3OptionalSet(vec3, 2, z) || propogate;

    if (propogate) {
        var i = 0;
        var list = this._components;
        var len = list.length;
        var item;
        x = vec3[0];
        y = vec3[1];
        z = vec3[2];
        for (; i < len ; i++) {
            item = list[i];
            if (item && item.onOriginChange) item.onOriginChange(x, y, z);
        }
    }
};


Node.prototype.setPosition = function setPosition (x, y, z) {
    var vec3 = this.value.vectors.position;
    var propogate = false;

    propogate = this._vec3OptionalSet(vec3, 0, x) || propogate;
    propogate = this._vec3OptionalSet(vec3, 1, y) || propogate;
    propogate = this._vec3OptionalSet(vec3, 2, z) || propogate;

    if (propogate) {
        var i = 0;
        var list = this._components;
        var len = list.length;
        var item;
        x = vec3[0];
        y = vec3[1];
        z = vec3[2];
        for (; i < len ; i++) {
            item = list[i];
            if (item && item.onPositionChange) item.onPositionChange(x, y, z);
        }
    }
};

Node.prototype.setRotation = function setRotation (x, y, z) {
    var vec3 = this.value.vectors.rotation;
    var propogate = false;

    propogate = this._vec3OptionalSet(vec3, 0, x) || propogate;
    propogate = this._vec3OptionalSet(vec3, 1, y) || propogate;
    propogate = this._vec3OptionalSet(vec3, 2, z) || propogate;

    if (propogate) {
        var i = 0;
        var list = this._components;
        var len = list.length;
        var item;
        x = vec3[0];
        y = vec3[1];
        z = vec3[2];
        for (; i < len ; i++) {
            item = list[i];
            if (item && item.onRotationChange) item.onRotationChange(x, y, z);
        }
    }
};

Node.prototype.setScale = function setScale (x, y, z) {
    var vec3 = this.value.vectors.scale;
    var propogate = false;

    propogate = this._vec3OptionalSet(vec3, 0, x) || propogate;
    propogate = this._vec3OptionalSet(vec3, 1, y) || propogate;
    propogate = this._vec3OptionalSet(vec3, 2, z) || propogate;

    if (propogate) {
        var i = 0;
        var list = this._components;
        var len = list.length;
        var item;
        x = vec3[0];
        y = vec3[1];
        z = vec3[2];
        for (; i < len ; i++) {
            item = list[i];
            if (item && item.onScaleChange) item.onScaleChange(x, y, z);
        }
    }
};

Node.prototype.setOpacity = function setOpacity (val) {
    if (val != this.value.showState.opacity) {
        this.value.showState.opacity = val;
        if (!this._requestingUpdate) this._requestUpdate();

        var i = 0;
        var list = this._components;
        var len = list.length;
        var item;
        for (; i < len ; i++) {
            item = list[i];
            if (item && item.onOpacityChange) item.onOpacityChange(val);
        }
    }
};

Node.prototype.setSizeMode = function setSizeMode (x, y, z) {
    var vec3 = this.value.size.sizeMode;
    var propogate = false;

    propogate = this._vec3OptionalSet(vec3, 0, x) || propogate;
    propogate = this._vec3OptionalSet(vec3, 1, y) || propogate;
    propogate = this._vec3OptionalSet(vec3, 2, z) || propogate;

    if (propogate) {
        var i = 0;
        var list = this._components;
        var len = list.length;
        var item;
        x = vec3[0];
        y = vec3[1];
        z = vec3[2];
        for (; i < len ; i++) {
            item = list[i];
            if (item && item.onSizeModeChange) item.onSizeModeChange(x, y, z);
        }
    }
};

Node.prototype.setProportionalSize = function setProportionalSize (x, y, z) {
    var vec3 = this.value.size.proportional;
    var propogate = false;

    propogate = this._vec3OptionalSet(vec3, 0, x) || propogate;
    propogate = this._vec3OptionalSet(vec3, 1, y) || propogate;
    propogate = this._vec3OptionalSet(vec3, 2, z) || propogate;

    if (propogate) {
        var i = 0;
        var list = this._components;
        var len = list.length;
        var item;
        x = vec3[0];
        y = vec3[1];
        z = vec3[2];
        for (; i < len ; i++) {
            item = list[i];
            if (item && item.onProportionalSizeChange) item.onProportionalSizeChange(x, y, z);
        }
    }
};

Node.prototype.setDifferentialSize = function setDifferentialSize (x, y, z) {
    var vec3 = this.value.size.differential;
    var propogate = false;

    propogate = this._vec3OptionalSet(vec3, 0, x) || propogate;
    propogate = this._vec3OptionalSet(vec3, 1, y) || propogate;
    propogate = this._vec3OptionalSet(vec3, 2, z) || propogate;

    if (propogate) {
        var i = 0;
        var list = this._components;
        var len = list.length;
        var item;
        x = vec3[0];
        y = vec3[1];
        z = vec3[2];
        for (; i < len ; i++) {
            item = list[i];
            if (item && item.onDifferentialSizeChange) item.onDifferentialSizeChange(x, y, z);
        }
    }
};

Node.prototype.setAbsoluteSize = function setAbsoluteSize (x, y, z) {
    var vec3 = this.value.size.absolute;
    var propogate = false;

    propogate = this._vec3OptionalSet(vec3, 0, x) || propogate;
    propogate = this._vec3OptionalSet(vec3, 1, y) || propogate;
    propogate = this._vec3OptionalSet(vec3, 2, z) || propogate;

    if (propogate) {
        var i = 0;
        var list = this._components;
        var len = list.length;
        var item;
        x = vec3[0];
        y = vec3[1];
        z = vec3[2];
        for (; i < len ; i++) {
            item = list[i];
            if (item && item.onAbsoluteSizeChange) item.onAbsoluteSizeChange(x, y, z);
        }
    }
};

Node.prototype._transformChanged = function _transformChanged (transform) {
    var i = 0;
    var items = this._components;
    var len = items.length;
    var item;

    for (; i < len ; i++) {
        item = items[i];
        if (item && item.onTransformChange) item.onTransformChange(transform);
    }

    i = 0;
    items = this._children;
    len = items.length;

    for (; i < len ; i++) {
        item = items[i];
        if (item && item.onParentTransformChange) item.onParentTransformChange(transform);
    }
};

Node.prototype._sizeChanged = function _sizeChanged (size) {
    var i = 0;
    var items = this._components;
    var len = items.length;
    var item;

    for (; i < len ; i++) {
        item = items[i];
        if (item && item.onSizeChange) item.onSizeChange(size);
    }

    i = 0;
    items = this._children;
    len = items.length;

    for (; i < len ; i++) {
        item = items[i];
        if (item && item.onParentSizeChange) item.onParentSizeChange(size);
    }
};

// DEPRICATE
Node.prototype.getFrame = function getFrame () {
    return Famous.getFrame();
};

Node.prototype.onUpdate = function onUpdate (time) {
    this._inUpdate = true;
    var nextQueue = this._nextUpdateQueue;
    var queue = this._updateQueue;
    var item;

    while (nextQueue.length) queue.unshift(nextQueue.pop());

    while (queue.length) {
        item = this._components[queue.shift()];
        if (item && item.onUpdate) item.onUpdate(time);
    }

    var mySize = this.getSize();
    var parent = this.getParent();
    var parentSize = parent.getSize();
    var myTransform = this.getTransform();
    var parentTransform = parent.getTransform();
    var sizeChanged = SIZE_PROCESSOR.fromSpecWithParent(parentSize, this.value, mySize);
    mySize = this.getSize();
 
    var transformChanged = TRANSFORM_PROCESSOR.fromSpecWithParent(this.getParent().getTransform(), this.value, mySize, parentSize, this.getTransform());
    if (transformChanged) this._transformChanged(this.getTransform());
    if (sizeChanged) this._sizeChanged(this.getSize());

    this._inUpdate = false;
    this._requestingUpdate = false;

    if (this._nextUpdateQueue.length) {
        this._globalUpdater.requestUpdateOnNextTick(this);
        this._requestingUpdate = true;
    }
};

Node.prototype.mount = function mount (parent, myId) {
    if (this.isMounted()) return; 
    var i = 0;
    var list = this._components;
    var len = list.length;
    var item;

    this._parent = parent;
    this._globalUpdater = parent.getUpdater();
    this.value.location = myId;
    this.value.showState.mounted = true;

    for (; i < len ; i++) {
        item = list[i];
        if (item.onMount) item.onMount(this, myId + ':' + i, i);
    }
    
    i = 0;
    list = this._children;
    len = list.length;
    for (; i < len ; i++) {
        item = list[i];
        if (item.onParentMount) item.onParentMount(this, myId, i);
    }

    if (this._requestingUpdate) this._requestUpdate(true);
};

Node.prototype.dismount = function dismount () {
    if (!this.isMounted()) return; 
    var i = 0;
    var list = this._components;
    var len = list.length;
    var item;

    this.value.showState.mounted = false;
    this.value.location = null;

    this._parent.removeChild(this);

    this._parent = null;

    for (; i < len ; i++) {
        item = list[i];
        if (item.onDismount) item.onDismount();
    }
    
    i = 0;
    list = this._children;
    len = list.length;
    for (; i < len ; i++) {
        item = list[i];
        if (item.onParentDismount) item.onParentDismount();
    }

    if (!this._requestingUpdate) this._requestUpdate();
    this._globalUpdater = null;
};

Node.prototype.onParentMount = function onParentMount (parent, parentId, index) {
    this.mount(parent, parentId + '/' + index);
};

Node.prototype.onParentDismount = function onParentDismount () {
    this.dismount();
};

Node.prototype.onParentShow = Node.prototype.show;

Node.prototype.onParentHide = Node.prototype.hide;

Node.prototype.onParentTransformChange = Node.prototype._requestUpdate; 

Node.prototype.onParentSizeChange = Node.prototype._requestUpdate;

Node.prototype.onShow = Node.prototype.show;

Node.prototype.onHide = Node.prototype.hide;

Node.prototype.onMount = Node.prototype.mount;

Node.prototype.onDismount = Node.prototype.dismount;

Node.prototype.onReceive = function onRecieve (event, payload) {
    console.log(event, payload);
};

module.exports = Node;


