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
 * A collection of utilities for handling paths.
 *
 * @class
 */
function PathUtils () {
}

/**
 * determines if the passed in path has a trailing slash. Paths of the form
 * 'body/0/1/' return true, while paths of the form 'body/0/1' return false.
 *
 * @method
 *
 * @param {String} path the path
 *
 * @return {Boolean} whether or not the path has a trailing slash
 */
PathUtils.prototype.hasTrailingSlash = function hasTrailingSlash (path) {
    return path[path.length - 1] === '/';
};

/**
 * Returns the depth in the tree this path represents. Essentially counts
 * the slashes ignoring a trailing slash.
 *
 * @method
 *
 * @param {String} path the path
 *
 * @return {Number} the depth in the tree that this path represents
 */
PathUtils.prototype.depth = function depth (path) {
    var count = 0;
    var length = path.length;
    var len = this.hasTrailingSlash(path) ? length - 1 : length;
    var i = 0;
    for (; i < len ; i++) count += path[i] === '/' ? 1 : 0;
    return count;
};

/**
 * Gets the position of this path in relation to its siblings.
 *
 * @method
 *
 * @param {String} path the path
 *
 * @return {Number} the index of this path in relation to its siblings.
 */
PathUtils.prototype.index = function index (path) {
    var length = path.length;
    var len = this.hasTrailingSlash(path) ? length - 1 : length;
    while (len--) if (path[len] === '/') break;
    var result = parseInt(path.substring(len + 1));
    return isNaN(result) ? 0 : result;
};

/**
 * Gets the position of the path at a particular breadth in relationship
 * to its siblings
 *
 * @method
 *
 * @param {String} path the path
 * @param {Number} depth the breadth at which to find the index
 *
 * @return {Number} index at the particular depth
 */
PathUtils.prototype.indexAtDepth = function indexAtDepth (path, depth) {
    var i = 0;
    var len = path.length;
    var index = 0;
    for (; i < len ; i++) {
        if (path[i] === '/') index++;
        if (index === depth) {
            path = path.substring(i ? i + 1 : i);
            index = path.indexOf('/');
            path = index === -1 ? path : path.substring(0, index);
            index = parseInt(path);
            return isNaN(index) ? path : index;
        }
    }
};

/**
 * returns the path of the passed in path's parent.
 *
 * @method
 *
 * @param {String} path the path
 *
 * @return {String} the path of the passed in path's parent
 */
PathUtils.prototype.parent = function parent (path) {
    return path.substring(0, path.lastIndexOf('/', path.length - 2));
};

/**
 * Determines whether or not the first argument path is the direct child
 * of the second argument path.
 *
 * @method
 *
 * @param {String} child the path that may be a child
 * @param {String} parent the path that may be a parent
 *
 * @return {Boolean} whether or not the first argument path is a child of the second argument path
 */
PathUtils.prototype.isChildOf = function isChildOf (child, parent) {
    return this.isDescendentOf(child, parent) && this.depth(child) === this.depth(parent) + 1;
};

/**
 * Returns true if the first argument path is a descendent of the second argument path.
 *
 * @method
 *
 * @param {String} child potential descendent path
 * @param {String} parent potential ancestor path
 *
 * @return {Boolean} whether or not the path is a descendent
 */
PathUtils.prototype.isDescendentOf = function isDescendentOf(child, parent) {
    if (child === parent) return false;
    child = this.hasTrailingSlash(child) ? child : child + '/';
    parent = this.hasTrailingSlash(parent) ? parent : parent + '/';
    return this.depth(parent) < this.depth(child) && child.indexOf(parent) === 0;
};

/**
 * returns the selector portion of the path.
 *
 * @method
 *
 * @param {String} path the path
 *
 * @return {String} the selector portion of the path.
 */
PathUtils.prototype.getSelector = function getSelector(path) {
    var index = path.indexOf('/');
    return index === -1 ? path : path.substring(0, index);
};

module.exports = new PathUtils();

