'use strict';

function VirtualObservable(target, compositor) {
    this._compositor = compositor;
    this._listeners = Object.create(null);
    this._target = target;
}

VirtualObservable.prototype.listen = function listen(type) {
    if (!this._listeners[type]) {
        var _this = this;
        var listener = function(ev) {
            ev = _this._serializeEvent(ev);
            _this._compositor.sendEvent(_this._target, type, ev);
        };
        window[this._target].addEventListener(type, listener);
        this._listeners[type] = listener;
    }

    return this;
};

VirtualObservable.prototype._serializeEvent = function _serializeEvent(ev) {
    var serializeableEvent = {};
    for (var key in ev) {
        switch (typeof ev[key]) {
            case 'object':
            case 'function':
                break;
            default:
                serializeableEvent[key] = ev[key];
                break;
        }
    }
    return serializeableEvent;
};

module.exports = VirtualObservable;
