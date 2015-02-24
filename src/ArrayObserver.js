'use strict';

var MethodStore = require('famous-utilities').MethodStore;
var CallbackStore = require('famous-utilities').CallbackStore;

var UPDATE = 'UPDATE';
var ADDED = 'ADDED';
var REMOVED = 'REMOVED';

function ArrayObserver (arr, type) {
    this.changes = [];
    this.type = ArrayObserver.PUSH;
    this.observer = function (changes) {
        this.changes = this.changes.concat(changes);
        if (this.type === ArrayObserver.PUSH) this.dispatch();
    }.bind(this);
    this.target = arr;
    switch (type) {
    case ArrayObserver.METHODS: this.callbacks = new MethodStore();
    default: this.callbacks = new CallbackStore();
    }
}

ArrayObserver.PUSH = 0;
ArrayObserver.PULL = 1;
ArrayObserver.METHODS = 2;
ArrayObserver.CALLBACKS = 3;

ArrayObserver.prototype.startObserving = function startObserving () {
    Array.observe(this.target, this.observer);
    return this;
};

ArrayObserver.prototype.stopObserving = function stopObserving () {
    Array.unobserve(this.target, this.observer);
    return this;
};

ArrayObserver.prototype.makePush = function makePush () {
    this.type = ArrayObserver.PUSH;
    return this;
};

ArrayObserver.prototype.makePull = function makePull () {
    this.type = ArrayObserver.PULL;
    return this;
};

ArrayObserver.prototype.subscribe = function subscribe () {
    this.callbacks.on.apply(this.callbacks, arguments);
    return this;
};

ArrayObserver.prototype.dispatch = function dispatch () {
    var i = 0;
    var len = this.changes.length;
    for (; i < len ; i++) {
        var change = this.changes.shift();
        if (change.type === UPDATE) this.callbacks.trigger(UPDATE, change);
        else {
            if (change.addedCount > 0) this.callbacks.trigger(ADDED, change);
            if (change.removed.length > 0) this.callbacks.trigger(REMOVED, change);
        }
    }
    return this;
};

module.exports = ArrayObserver;
