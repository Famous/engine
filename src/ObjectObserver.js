'use strict';

var MethodStore = require('famous-utilities').MethodStore;
var CallbackStore = require('famous-utilities').CallbackStore;

function ObjectObserver (obj, type) {
    this.changes = [];
    this.type = ObjectObserver.PUSH;
    this.observer = function (changes) {
        this.changes = this.changes.concat(changes);
        if (this.type === ObjectObserver.PUSH) this.dispatch();
    }.bind(this);
    this.target = obj;
    switch (type) {
    case ObjectObserver.METHODS: this.callbacks = new MethodStore();
    default: this.callbacks = new CallbackStore();
    }
}

ObjectObserver.PUSH = 0;
ObjectObserver.PULL = 1;
ObjectObserver.METHODS = 2;
ObjectObserver.CALLBACKS = 3;

ObjectObserver.prototype.startObserving = function startObserving () {
    Object.observe(this.target, this.observer);
    return this;
};

ObjectObserver.prototype.stopObserving = function stopObserving () {
    Object.unobserve(this.target, this.observer);
    return this;
};

ObjectObserver.prototype.makePush = function makePush () {
    this.type = ObjectObserver.PUSH;
    return this;
};

ObjectObserver.prototype.makePull = function makePull () {
    this.type = ObjectObserver.PULL;
    return this;
};

ObjectObserver.prototype.subscribe = function subscribe () {
    this.callbacks.on.apply(this.callbacks, arguments);
    return this;
};

ObjectObserver.prototype.dispatch = function dispatch () {
    var i = 0;
    var len = this.changes.length;
    var change;
    for (; i < len ; i++) {
        change = this.changes.shift();
        this.callbacks.trigger(change.name, change);
    }
    return this;
};

module.exports = ObjectObserver;
