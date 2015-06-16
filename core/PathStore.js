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

/*jshint -W079 */

'use strict';

var PathUtils = require('./Path');

/**
 * A class that can be used to associate any item with a path.
 * Items and paths are kept in flat arrays for easy iteration
 * and a memo is used to provide constant time lookup.
 *
 * @class
 *
 */
function PathStore () {
    this.items = [];
    this.paths = [];
    this.memo = {};
}

/**
 * Associates an item with the given path. Errors if an item
 * already exists at the given path.
 *
 * @method
 *
 * @param {String} path The path at which to insert the item
 * @param {Any} item The item to associate with the given path.
 *
 * @return {undefined} undefined
 */
PathStore.prototype.insert = function insert (path, item) {
    var paths = this.paths;
    var index = paths.indexOf(path);
    if (index !== -1)
        throw new Error('item already exists at path: ' + path);

    var i = 0;
    var targetDepth = PathUtils.depth(path);
    var targetIndex = PathUtils.index(path);

    // The item will be inserted at a point in the array
    // such that it is within its own breadth in the tree
    // that the paths represent
    while (
        paths[i] &&
        targetDepth >= PathUtils.depth(paths[i])
    ) i++;

    // The item will be sorted within its breadth by index
    // in regard to its siblings.
    while (
        paths[i] &&
        targetDepth === PathUtils.depth(paths[i]) &&
        targetIndex < PathUtils.index(paths[i])
    ) i++;

    // insert the items in the path
    paths.splice(i, 0, path);
    this.items.splice(i, 0, item);

    // store the relationship between path and index in the memo
    this.memo[path] = i;

    // all items behind the inserted item are now no longer
    // accurately stored in the memo. Thus the memo must be cleared for
    // these items.
    for (var len = this.paths.length ; i < len ; i++)
        this.memo[this.paths[i]] = null;
};

/**
 * Removes the the item from the store at the given path.
 * Errors if no item exists at the given path.
 *
 * @method
 *
 * @param {String} path The path at which to remove the item.
 *
 * @return {undefined} undefined
 */
PathStore.prototype.remove = function remove (path) {
    var paths = this.paths;
    var index = this.memo[path] ? this.memo[path] : paths.indexOf(path);
    if (index === -1)
        throw new Error('Cannot remove. No item exists at path: ' + path);

    paths.splice(index, 1);
    this.items.splice(index, 1);

    this.memo[path] = null;

    for (var len = this.paths.length ; index < len ; index++)
        this.memo[this.paths[index]] = null;
};

/**
 * Returns the item stored at the current path. Returns undefined
 * if no item is stored at that path.
 *
 * @method
 *
 * @param {String} path The path to lookup the item for
 *
 * @return {Any | undefined} the item stored or undefined
 */
PathStore.prototype.get = function get (path) {
    if (this.memo[path]) return this.items[this.memo[path]];

    var index = this.paths.indexOf(path);

    if (index === -1) return void 0;

    this.memo[path] = index;

    return this.items[index];
};

/**
 * Returns an array of the items currently stored in this
 * PathStore.
 *
 * @method
 *
 * @return {Array} items currently stored
 */
PathStore.prototype.getItems = function getItems () {
    return this.items;
};

/**
 * Returns an array of the paths currently stored in this
 * PathStore.
 *
 * @method
 *
 * @return {Array} paths currently stored
 */
PathStore.prototype.getPaths = function getPaths () {
    return this.paths;
};

module.exports = PathStore;
