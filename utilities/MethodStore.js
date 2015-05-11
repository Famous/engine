'use strict';

function MethodStore () {
    this._events = {};
}

MethodStore.prototype.on = function on (key, cbclass, cbname) {
    var events = this._events[key];
    if (!events) events = [];
    events.push(cbclass, cbname);
    return this;
}

MethodStore.prototype.off = function off (key, cbclass) {
    var events = this._events[key];
    if (events) {
        var index = events.indexOf(cbclass);
        if (index > -1) events.splice(index, 2);
    }
    return this;
}

MethodStore.prototype.trigger = function trigger (key, payload) {
    var events = this._events[key];
    if (events) {
        var i = 0;
        var len = events.length;
        for (; i < len ; i += 2) events[i][events[i + 1]](payload);
    }
    return this;
};

module.exports = MethodStore;
