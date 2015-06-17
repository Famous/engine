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

var PathStore = require('./PathStore');
var Size = require('./Size');
var Dispatch = require('./Dispatch');
var PathUtils = require('./Path');

/**
 * The size system is used to calculate size throughout the scene graph.
 * It holds size components and operates upon them.
 *
 * @constructor
 */
function SizeSystem () {
    this.pathStore = new PathStore();
}

/**
 * Registers a size component to a give path. A size component can be passed as the second argument
 * or a default one will be created. Throws if no size component has been added at the parent path.
 *
 * @method
 *
 * @param {String} path The path at which to register the size component
 * @param {Size | undefined} size The size component to be registered or undefined.
 *
 * @return {undefined} undefined
 */
SizeSystem.prototype.registerSizeAtPath = function registerSizeAtPath (path, size) {
    if (!PathUtils.depth(path)) return this.pathStore.insert(path, size ? size : new Size());

    var parent = this.pathStore.get(PathUtils.parent(path));

    if (!parent) throw new Error(
            'No parent size registered at expected path: ' + PathUtils.parent(path)
    );

    if (size) size.setParent(parent);

    this.pathStore.insert(path, size ? size : new Size(parent));
};

/**
 * Removes the size component from the given path. Will throw if no component is at that
 * path
 *
 * @method
 *
 * @param {String} path The path at which to remove the size.
 *
 * @return {undefined} undefined
 */
SizeSystem.prototype.deregisterSizeAtPath = function deregisterSizeAtPath(path) {
    this.pathStore.remove(path);
};

/**
 * Returns the size component stored at a given path. Returns undefined if no
 * size component is registered to that path.
 *
 * @method
 *
 * @param {String} path The path at which to get the size component.
 *
 * @return {undefined} undefined
 */
SizeSystem.prototype.get = function get (path) {
    return this.pathStore.get(path);
};

/**
 * Updates the sizes in the scene graph. Called internally by the famous engine.
 *
 * @method
 *
 * @return {undefined} undefined
 */
SizeSystem.prototype.update = function update () {
    var sizes = this.pathStore.getItems();
    var paths = this.pathStore.getPaths();
    var node;
    var size;
    var i;
    var len;
    var components;

    for (i = 0, len = sizes.length ; i < len ; i++) {
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

// private methods

/**
 * Private method to alert the node and components that size mode changed.
 *
 * @method
 * @private
 *
 * @param {Node} node Node to potentially call sizeModeChanged on
 * @param {Array} components a list of the nodes' components
 * @param {Size} size the size class for the Node
 *
 * @return {undefined} undefined
 */
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

/**
 * Private method to alert the node and components that absoluteSize changed.
 *
 * @method
 * @private
 *
 * @param {Node} node Node to potentially call onAbsoluteSizeChange on
 * @param {Array} components a list of the nodes' components
 * @param {Size} size the size class for the Node
 *
 * @return {undefined} undefined
 */
function absoluteSizeChanged (node, components, size) {
    var absoluteSize = size.getAbsolute();
    var x = absoluteSize[0];
    var y = absoluteSize[1];
    var z = absoluteSize[2];
    if (node.onAbsoluteSizeChange) node.onAbsoluteSizeChange(x, y, z);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onAbsoluteSizeChange)
            components[i].onAbsoluteSizeChange(x, y, z);
    size.absoluteSizeChanged = false;
}

/**
 * Private method to alert the node and components that the proportional size changed.
 *
 * @method
 * @private
 *
 * @param {Node} node Node to potentially call onProportionalSizeChange on
 * @param {Array} components a list of the nodes' components
 * @param {Size} size the size class for the Node
 *
 * @return {undefined} undefined
 */
function proportionalSizeChanged (node, components, size) {
    var proportionalSize = size.getProportional();
    var x = proportionalSize[0];
    var y = proportionalSize[1];
    var z = proportionalSize[2];
    if (node.onProportionalSizeChange) node.onProportionalSizeChange(x, y, z);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onProportionalSizeChange)
            components[i].onProportionalSizeChange(x, y, z);
    size.proportionalSizeChanged = false;
}

/**
 * Private method to alert the node and components that differential size changed.
 *
 * @method
 * @private
 *
 * @param {Node} node Node to potentially call onDifferentialSize on
 * @param {Array} components a list of the nodes' components
 * @param {Size} size the size class for the Node
 *
 * @return {undefined} undefined
 */
function differentialSizeChanged (node, components, size) {
    var differentialSize = size.getDifferential();
    var x = differentialSize[0];
    var y = differentialSize[1];
    var z = differentialSize[2];
    if (node.onDifferentialSizeChange) node.onDifferentialSizeChange(x, y, z);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onDifferentialSizeChange)
            components[i].onDifferentialSizeChange(x, y, z);
    size.differentialSizeChanged = false;
}

/**
 * Private method to alert the node and components that render size changed.
 *
 * @method
 * @private
 *
 * @param {Node} node Node to potentially call onRenderSizeChange on
 * @param {Array} components a list of the nodes' components
 * @param {Size} size the size class for the Node
 *
 * @return {undefined} undefined
 */
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

/**
 * Private method to alert the node and components that the size changed.
 *
 * @method
 * @private
 *
 * @param {Node} node Node to potentially call onSizeChange on
 * @param {Array} components a list of the nodes' components
 * @param {Size} size the size class for the Node
 *
 * @return {undefined} undefined
 */
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
