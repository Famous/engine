'use strict';

/**
 * Proxies provide a way to access arbitrary global objects within a WebWorker.
 * 
 * @class Proxy
 * @constructor
 * @private
 * 
 * @param {String} target               window[target] refers to the proxied
 *                                      object
 * @param {MessageQueue} messageQueue   the message queue being used to append
 *                                      commands onto
 * @param {ProxyRegistry} proxyRegistry registry being used in order to
 *                                      register functions
 */
function Proxy(target, messageQueue, proxyRegistry) {
    this._target = target;
    this._messageQueue = messageQueue;
    this._proxyRegistry = proxyRegistry;
}

Proxy.prototype.invoke = function(methodName, args) {
    this._messageQueue.enqueue('INVOKE');
    this._messageQueue.enqueue(this._target);
    this._messageQueue.enqueue(methodName);

    var functionArgs = [];

    var functionId;
    for (var i = 0; i < args.length; i++) {
        functionArgs[i] = null;
        if (typeof args[i] === 'function') {
            functionId = this._proxyRegistry.registerCallback(args[i]);
            functionArgs[i] = functionId;
            args[i] = null;
        }
    }
    this._messageQueue.enqueue(args);
    this._messageQueue.enqueue(functionArgs);
};

module.exports = Proxy;
