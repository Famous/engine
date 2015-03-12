'use strict';

var VirtualObservable = require('./VirtualObservable');

function VirtualWindow(compositor) {
    this._compositor = compositor;
    this._virtualObservables = Object.create(null);
}

VirtualWindow.prototype.listen = function listen(target, type) {
    if (!this._virtualObservables[target]) {
        this._virtualObservables[target] = new VirtualObservable(target, this._compositor);
    }
    this._virtualObservables[target].listen(type);
    return this;
};

module.exports = VirtualWindow;
