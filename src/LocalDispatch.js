var RenderContext = require('./RenderContext');

function LocalDispatch (globaldispatch) {
    this._id = globaldispatch.addComponent(this);
    this._dispatch = globaldispatch;
    this._requestingUpdate = false;

    this.messageTargets = {
        onParentOpacityChange: [],
        onParentTransformChange: [],
        onParentSizeChange: [],
        onParentShow: [],
        onParentHide: [],
        onParentMount: [],
        onParentDismount: [],
        onMount: [],
        onDismount: [],
        onShow: [],
        onHide: [],
        onOpacityChange: [],
        onAlignChange: [],
        onMountPointChange: [],
        onPositionChange: [],
        onRotationChange: [],
        onScaleChange: [],
        onTransformChange: [],
        onProportionalSizeChange: [],
        onDifferentialSizeChange: [],
        onAbsoluteSizeChange: [],
        onContextSizeChange: []
    };
    this.updateQueue = [];
    this.components = [];

    this._contextId = this.addComponent(new RenderContext(this));
}

LocalDispatch.prototype.addComponent = function addComponent (component) {
    var key;
    for (key in this.messageTargets)
        if (component[key].constructor === Function)
            this.messageTargets[key].push(component);

    var context = this.getContext();
    if (context.isMounted() && component.onMount) component.onMount(context.getParent());
    if (context.isShown() && component.onShow) component.onShow();

    return this.components.push(component) - 1;
};

LocalDispatch.prototype.requestUpdate = function requestUpdate (id) {
    var component = this.components[id];
    if (component.onAddedToUpdateQueue) component.onAddedToUpdateQueue(this.updateQueue.length);
    this.updateQueue.push(id);
    return this;
};

LocalDispatch.prototype.parentOpacityChanged = function parentOpacityChanged (value) {
    var queue = this.messageTargets.onParentOpacityChange;
    for (var i = 0, len = queue.length ; i < len ; i++) queue[i].onParentOpacityChange(value);
};

LocalDispatch.prototype.parentTransformChanged = function parentTransformChanged (report, value) {
    var queue = this.messageTargets.onParentTransformChange;
    for (var i = 0, len = queue.length ; i < len ; i++) queue[i].onParentTransformChange(report, value);
};

LocalDispatch.prototype.parentSizeChange = function onParentSizeChange (report, x, y, z) {
    var queue = this.messageTargets.onParentTransformChange;
    for (var i = 0, len = queue.length ; i < len ; i++) queue[i].onParentTransformChange(report, x, y, z);
};

LocalDispatch.prototype.parentShown = function parentShown () {
    var queue = this.messageTargets.onParentShow;
    for (var i = 0, len = queue.length ; i < len ; i++) queue[i].onParentShow();
};

LocalDispatch.prototype.parentHidden = function parentHidden () {
    var queue = this.messageTargets.onParentHide;
    for (var i = 0, len = queue.length ; i < len ; i++) queue[i].onParentHide();
};

LocalDispatch.prototype.parentMounted = function parentMounted () {
    var queue = this.messageTargets.onParentMount;
    for (var i = 0, len = queue.length ; i < len ; i++) queue[i].onParentMount();
};

LocalDispatch.prototype.parentDismounted = function parentDismounted () {
    var queue = this.messageTargets.onParentDismount;
    for (var i = 0, len = queue.length ; i < len ; i++) queue[i].onParentDismount();
};

LocalDispatch.prototype.mount = function mount () {
    var queue = this.messageTargets.onMount;
    for (var i = 0, len = queue.length ; i < len ; i++) queue[i].onMount();
};

LocalDispatch.prototype.dismount = function dismount () {
    var queue = this.messageTargets.onDismount;
    for (var i = 0, len = queue.length ; i < len ; i++) queue[i].onDismount();
};

LocalDispatch.prototype.shown = function shown () {
    var queue = this.messageTargets.onShow;
    for (var i = 0, len = queue.length ; i < len ; i++) queue[i].onShow();
};

LocalDispatch.prototype.hide = function shown () {
    var queue = this.messageTargets.onHide;
    for (var i = 0, len = queue.length ; i < len ; i++) queue[i].onHide();
};

LocalDispatch.prototype.opacityChanged = function opacityChanged (value) {
    var queue = this.messageTargets.onOpacityChange;
    for (var i = 0, len = queue.length ; i < len ; i++) queue[i].onOpacityChange(value);
};

LocalDispatch.prototype.alignChanged = function alignChanged (report, x, y, z) {
    var queue = this.messageTargets.onAlignChange;
    for (var i = 0, len = queue.length ; i < len ; i++) queue[i].onAlignChange(report, x, y, z);
};

LocalDispatch.prototype.mountPointChanged = function mountPointChanged (report, x, y, z) {
    var queue = this.messageTargets.onMountPointChange;
    for (var i = 0, len = queue.length ; i < len ; i++) queue[i].onMountPointChange(report, x, y, z);
};

LocalDispatch.prototype.originChanged = function originChanged (report, x, y, z) {
    var queue = this.messageTargets.onOriginChange;
    for (var i = 0, len = queue.length ; i < len ; i++) queue[i].onOriginChange(report, x, y, z);
};

LocalDispatch.prototype.positionChanged = function positionChanged (report, x, y, z) {
    var queue = this.messageTargets.onPositionChange;
    for (var i = 0, len = queue.length ; i < len ; i++) queue[i].onPositionChange(report, x, y, z);
};

LocalDispatch.prototype.rotationChanged = function rotationChanged (report, x, y, z) {
    var queue = this.messageTargets.onRotationChange;
    for (var i = 0, len = queue.length ; i < len ; i++) queue[i].onRotationChange(report, x, y, z);
};

LocalDispatch.prototype.scaleChanged = function scaleChanged (report, x, y, z) {
    var queue = this.messageTargets.onScaleChange;
    for (var i = 0, len = queue.length ; i < len ; i++) queue[i].onScaleChange(report, x, y, z);
};

LocalDispatch.prototype.transformChanged = function transformChanged (report, value) {
    var queue = this.messageTargets.onTransformChange;
    for (var i = 0, len = queue.length ; i < len ; i++) queue[i].onTransformChange(report, x, y, z);
};

LocalDispatch.prototype.proportionalSizeChanged = function proportionalSizeChanged (report, x, y, z) {
    var queue = this.messageTargets.onProportionalSizeChange;
    for (var i = 0, len = queue.length ; i < len ; i++) queue[i].onProportionalSizeChange(report, x, y, z);
};

LocalDispatch.prototype.differentialSizeChanged = function differentialSizeChanged (report, x, y, z) {
    var queue = this.messageTargets.onDifferentialSizeChange;
    for (var i = 0, len = queue.length ; i < len ; i++) queue[i].onDifferentialSizeChange(report, x, y, z);
};

LocalDispatch.prototype.absoluteSizeChanged = function absoluteSizeChanged (report, x, y, z) {
    var queue = this.messageTargets.onAbsoluteSizeChange;
    for (var i = 0, len = queue.length ; i < len ; i++) queue[i].onAbsoluteSizeChange(report, x, y, z);
};

LocalDispatch.prototype.contextSizeChanged = function contextSizeChanged (report, x, y, z) {
    var queue = this.messageTargets.onContextSizeChange;
    for (var i = 0, len = queue.length ; i < len ; i++) queue[i].onContextSizeChange(report, x, y, z);
};

