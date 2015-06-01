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

var Layer = require('./layer');
var Size = require('./Size');
var Dispatch = require('./Dispatch');
var PathUtils = require('./Path');

function SizeSystem () {
    this.layer = new Layer();
}

SizeSystem.prototype.registerSizeAtPath = function registerSizeAtPath (path) {
    if (!PathUtils.depth(path)) return this.layer.insert(path, new Size());

    var parent = this.layer.get(PathUtils.parent(path));

    if (!parent) throw new Error(
            'No parent size registered at expected path: ' + PathUtils.parent(path)
    );

    this.layer.insert(path, new Size(parent));
};

SizeSystem.prototype.deregisterSizeAtPath = function deregisterSizeAtPath(path) {
    this.layer.remove(path);
};

SizeSystem.prototype.get = function get (path) {
    return this.layer.get(path);
};

SizeSystem.prototype.update = function update () {
    var sizes = this.layer.getItems();
    var paths = this.layer.getPaths();
    var node;
    var size;
    var i;
    var len;
    var components;

    for (var i = 0, len = sizes.length ; i < len ; i++) {
        node = Dispatch.getNode(paths[i]);
        components = node.getComponents();
        if (!node) continue;
        size = sizes[i];
        if (size.sizeModeChanged) sizeModeChanged(node, components, size);
        if (size.absoluteSizeChanged) absoluteSizeChanged(node, components, size);
        if (size.proportionalSizeChanged) proportionalSizeChanged(node, components, size);
        if (size.differentialSizeChanged) differentialSizeChanged(node, components, size);
        if (size.renderSizeChanged) renderSizeChanged(node, components, size);
        if (size.fromComponents(components)) sizeChanged(node, components, size);
    }
};

function sizeModeChanged (node, components, size) {
    var sizeMode = size.getSizeMode();
    var x = sizeMode[0];
    var y = sizeMode[1];
    var z = sizeMode[2];
    if (node.onSizeModeChange) node.onSizeModeChange(x, y, z);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onSizeModeChange)
            components[i].onSizeModeChange(x, y, z);
    size.sizeModeChanged = false;
}
    
function absoluteSizeChanged (node, components, size) {
    var absoluteSize = size.getAbsoluteSize();
    var x = absoluteSize[0];
    var y = absoluteSize[1];
    var z = absoluteSize[2];
    if (node.onAbsoluteSizeChange) node.onAbsoluteSizeChange(x, y, z);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onAbsoluteSizeChange)
            components[i].onAbsoluteSizeChange(x, y, z);
    size.absoluteSizeChanged = false;
}

function proportionalSizeChanged (node, components, size) {
    var proportionalSize = size.getProportionalSize();
    var x = proportionalSize[0];
    var y = proportionalSize[1];
    var z = proportionalSize[2];
    if (node.onProportionalSizeChange) node.onProportionalSizeChange(x, y, z);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onProportionalSizeChange)
            components[i].onProportionalSizeChange(x, y, z);
    size.proportionalSizeChanged = false;
}

function differentialSizeChanged (node, components, size) {
    var differentialSize = size.getDifferentialSize();
    var x = differentialSize[0];
    var y = differentialSize[1];
    var z = differentialSize[2];
    if (node.onDifferentialSizeChange) node.onDifferentialSizeChange(x, y, z);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onDifferentialSizeChange)
            components[i].onDifferentialSizeChange(x, y, z);
    size.differentialSizeChanged = false;
}

function renderSizeChanged (node, components, size) {
    var renderSize = size.getRenderSize();
    var x = renderSize[0];
    var y = renderSize[1];
    var z = renderSize[2];
    if (node.onRenderSizeChange) node.onRenderSizeChange(x, y, z);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onRenderSizeChange)
            components[i].onRenderSizeChange(x, y, z);
    size.renderSizeChanged = false;
}

function sizeChanged (node, components, size) {
    var finalSize = size.get();
    var x = finalSize[0];
    var y = finalSize[1];
    var z = finalSize[2];
    if (node.onSizeChange) node.onSizeChange(x, y, z);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onSizeChange)
            components[i].onSizeChange(x, y, z);
    size.sizeChanged = false;
}

module.exports = new SizeSystem();
