'use strict';

function EventReceiver (dispatch) {
    this.dispatch = dispatch;
}

EventReceiver.prototype.on = function on (ev, cb) {
    this.dispatch.registerGlobalEvent(ev, cb);
};

EventReceiver.prototype.off = function off (ev, cb) {
    this.dispatch.deregisterGlobalEvent(ev, cb)
};

module.exports = EventReceiver;