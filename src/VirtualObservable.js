'use strict';

function VirtualObservable(target, compositor) {
    this._compositor = compositor;
    this._listeners = Object.create(null);
    this._target = target;
}

VirtualObservable.prototype.addEventListener = function(type) {
    if (!this._listeners[type]) {
        var _this = this;
        var listener = function(ev) {
            ev = 'yolo';
            _this._compositor.sendEvent(_this._target, type, ev);
        };
        window[this._target].addEventListener(type, listener);
        this._listeners[type] = listener;
    }

    return this;
};

module.exports = VirtualObservable;
