var CallbackStore = require('famous-utilities').CallbackStore;

function Frame () {
    this._showing = false;
    this._dispatch = null;
    this._renderables = {};
    this._events = new CallbackStore();
    this._transformCancel = null;
    this._sizeCancel = null;
    this._opacityCancel = null;
    this._awaitingMount = [];
}

Frame.prototype.addRenderable = function addRenderable (name, renderable, renderOpts) {
    this.removeRenderable(name);

    var result = {
        renderable: renderable,
        eventsCancel: {}
    };

    if (renderable.onShow)
        result.eventsCancel.onShow = this._events.on('show', renderable.onShow.bind(renderable));

    if (renderable.onHide)
        result.eventsCancel.onHide = this._events.on('hide', renderable.onHide.bind(renderable));

    if (renderable.onSizeChange)
        result.eventsCancel.onSizeChange = this._events.on('size', renderable.onSizeChange.bind(renderable));

    if (renderable.onTransformChange)
        result.eventsCancel.onTransformChange = this._events.on('transform', renderable.onTransformChange.bind(renderable));

    if (renderable.onOpacityChange)
        result.eventsCancel.onOpacityChange = this._events.on('opacity', renderable.onOpacityChange.bind(renderable));

    if (this._dispatch) this._mount(renderable);
    else this._awaitingMount.push(renderable);

    if (renderable.onRender) {
        result.eventsCancel.onRender = this._events.on('render', renderable.onRender.bind(renderable));
        renderable.onRender(renderOpts);
    }

    this._renderables[name] = result;

    return this.removeRenderable.bind(this, name);
};


Frame.prototype.removeRenderable = function removeRenderable (name) {
    var renderable = this._renderables[name];
    if (renderable) {
        var eventsCancel = renderable.eventsCancel;
        if (renderable.onHide) renderable.onHide();
        if (renderable.onDismount) renderable.onDismount();
        for (var key in eventsCancel) eventsCancel[key]();
        this._renderables[name] = null;
    }
};

Frame.prototype._mount = function _mount (renderable) {
    renderable.acceptRenderProxy(this._dispatch._renderProxy);
    if (renderable.onMount) renderable.onMount();
    if (renderable.onSizeChange) renderable.onSizeChange(this._dispatch.getContext().getSize());
    if (renderable.onTransformChange) renderable.onTransformChange(this._dispatch.getContext().getTransform());
    if (renderable.onOpacityChange) renderable.onOpacityChange(this._dispatch.getContext().getOpacity());
};

Frame.prototype._dismount = function _dismount (renderable) {
    renderable.removeRenderProxy();
    if (renderable.onDismount) renderable.onDismount();
};

Frame.prototype._cancelEvents = function _cancelEvents () {
    if (this._transformCancel) this._transformCancel();
    if (this._sizeCancel) this._sizeCancel();
    if (this._opacityCancel) this._opacityCancel();
};

Frame.prototype._wireEvents = function _wireEvents () {
    this._transformCancel = this._dispatch.onTransformChange(this._events.trigger.bind(this._events, 'transform'));
    this._sizeCancel = this._dispatch.onSizeChange(this._events.trigger.bind(this._events, 'size'));
    this._opacityCancel = this._dispatch.onOpacityChange(this._events.trigger.bind(this._events, 'opacity'));
};

Frame.prototype._cycleEvents = function _cycleEvents () {
    this._cancelEvents();
    this._wireEvents();
}

Frame.prototype._wireDispatch = function _wireDispatch (dispatch) {
    this._dispatch = dispatch;
    this._cycleEvents();
};

Frame.prototype._acceptDispatch = function _acceptDispatch (dispatch) {
    var keys = Object.keys(this._renderables);
    var i;
    var len;

    this._wireDispatch(dispatch);

    for (i = 0, len = this._awaitingMount.length ; i < len ; i++)
        this._mount(this._awaitingMount[i]);

    for (i = 0, len = keys.length ; i < len ; i++) {
        this._dismount(this._renderables[key]);
        this._mount(this._renderables[key]);
    }
};

module.exports = Frame;
