'use strict';

/**
 * Singleton object to manage recycling of objects with typically short lifespans, used to cut down on the
 * amount of garbage collection required.
 *
 * @singleton
 */
var ObjectManager = {};

ObjectManager.pools = {};

/**
 * Register request and free functions for the given type.
 *
 * @method register
 * @param {String} type
 * @param {Function} Constructor
 */
ObjectManager.register = function(type, Constructor) {
    var pool = this.pools[type] = [];

    this['request' + type] = _request(pool, Constructor);
    this['free' + type] = _free(pool);
};

function _request(pool, Constructor) {
    return function request() {
        if (pool.length !== 0) return pool.pop();
        else return new Constructor();
    }
}

function _free(pool) {
    return function free(obj) {
        pool.push(obj);
    }
}

/**
 * Untrack all object of the given type. Used to allow allocated objects to be garbage collected.
 *
 * @method disposeOf
 * @param {String}
 */
ObjectManager.disposeOf= function(type) {
    var pool = this.pools[type];
    var i = pool.length;
    while (i--) pool.pop();
};

module.exports = ObjectManager;
