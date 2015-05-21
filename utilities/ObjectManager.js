/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

/**
 * Singleton object to manage recycling of objects with typically short
 * lifespans, used to cut down on the amount of garbage collection required.
 *
 * @singleton
 */
var ObjectManager = {};


/**
 * Internal pool used for storing instances of the regsitered constructors.
 *
 * @type {Object}
 * @private
 */
ObjectManager.pools = {};

/**
 * Register request and free functions for the given type.
 *
 * @method register
 *
 * @param {String} type             Unique object "type" to identity pools of
 *                                  allocated objects.
 * @param {Function} Constructor    Zero-argument Constructor function used for
 *                                  allocating new objects.
 * @return {undefined} undefined
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
    };
}

function _free(pool) {
    return function free(obj) {
        pool.push(obj);
    };
}

/**
 * Untrack all object of the given type. Used to allow allocated objects to be
 * garbage collected.
 *
 * @method disposeOf
 *
 * @param {String}  type    type as registered using
 *                          [register]{@link ObjectManager#register}.
 * @return {undefined} undefined
 */
ObjectManager.disposeOf = function(type) {
    var pool = this.pools[type];
    var i = pool.length;
    while (i--) pool.pop();
};

module.exports = ObjectManager;
