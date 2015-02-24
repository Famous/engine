'use strict';

function EventEmitter(dispatch) {
    this.dispatch = dispatch;
}

EventEmitter.toString = function toString() {
    return 'EventEmitter';
};

EventEmitter.prototype.emit = function emit(event, payload) {
    this.dispatch.emit(event, payload);
    return this;
};

module.exports = EventEmitter;
