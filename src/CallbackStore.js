'use strict';

function CallbackStore () {
    this.events = {};
}

CallbackStore.prototype.on = function on (key, cb) {
    if (!this.events[key]) this.events[key] = [];
    this.events[key].push(cb);
    return this;
};

CallbackStore.prototype.off = function off (key, cb) {
    var events = this.events[key];
    if (events) {
        var index = events.indexOf(cb);
        if (index > -1) events.splice(index, 1);
    }
    return this;
};

CallbackStore.prototype.trigger = function trigger (key, payload) {
    var events = this.events[key];
    if (events) {
        var i = 0;
        var len = events.length;
        for (; i < len ; i++) events[i](payload);
    }
    return this;
};

module.exports = CallbackStore;
