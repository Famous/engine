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

function PathUtils () {
}

PathUtils.prototype.hasTrailingSlash = function hasTrailingSlash (path) {
    return path[path.length - 1] === '/';
};

PathUtils.prototype.depth = function depth (path) {
    var count = 0;
    var length = path.length;
    var len = this.hasTrailingSlash(path) ? length - 1 : length;
    var i = 0;
    for (; i < len ; i++) count += path[i] === '/' ? 1 : 0;
    return count;
};

PathUtils.prototype.index = function index (path) {
    var length = path.length;
    var len = this.hasTrailingSlash(path) ? length - 1 : length;
    while (len--) if (path[len] === '/') break;
    var result = parseInt(path.substring(len + 1));
    return isNaN(result) ? 0 : result;
};

PathUtils.prototype.indexAtDepth = function indexAtDepth (path, depth) {
    var i = 0;
    var len = path.length;
    for (; i < len ; i++) {
        depth -= path[i] === '/' ? 1 : 0;
        if (!depth) {
            var index = path.indexOf(i, '/');
            var result = index === -1 ? path.substring(i) : path.substring(i, index);
            var num = parseInt(result);
            return isNaN(num) ? result : num;
        }
    }
};

PathUtils.prototype.parent = function parent (path) {
    return path.substring(0, path.lastIndexOf('/', path.length - 2));
};

PathUtils.prototype.isChildOf = function isChildOf (child, parent) {
    return this.isDescendentOf(child, parent) && this.depth(child) === this.depth(parent) + 1;
};

PathUtils.prototype.isDescendentOf = function isDescendentOf(child, parent) {
    child = this.hasTrailingSlash(child) ? child : child + '/';
    parent = this.hasTrailingSlash(parent) ? parent : parent + '/';
    return child.indexOf(parent) === 0;
};

PathUtils.prototype.getSelector = function getSelector(path) {
    var index = path.indexOf('/');
    return index === -1 ? path : path.substring(0, index);
};

module.exports = new PathUtils();

