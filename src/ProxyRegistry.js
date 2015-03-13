'use strict';

var Proxy = require('./Proxy');

function ProxyRegistry(messageQueue) {
    this._proxies = {};
    this._callbacks = {};
    this._nextCallbackId = 0;
    this._messageQueue = messageQueue;
}

ProxyRegistry.prototype.getInstance = function getInstance(target) {
    if (!this._proxies[target]) this._proxies[target] = new Proxy(target, this._messageQueue, this);
    return this._proxies[target];
};

ProxyRegistry.prototype.registerCallback = function registerCallback (callback) {
    var id = this._nextCallbackId++;
    this._callbacks[id] = callback;
    return id;
};

ProxyRegistry.prototype.invokeCallback = function invokeCallback (id, args) {
    // function in arguments returns value used by proxied object
    // (conceptual limitation of offloading a synchronous process to a
    // worker, which essentially turns it into an asynchronous operation)
    // TL;DR We return this, because we can't do anything meaningful with the
    // return value
    if (this._callbacks[id].apply(null, args) !== undefined) {
        console.warning('Return value of proxied functions are being ignored');
    }
    return this;
};

module.exports = ProxyRegistry;
