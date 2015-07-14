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

var PathUtils = require('./Path');
var Opacity = require('./Opacity');
var Dispatch = require('./Dispatch');
var PathStore = require('./PathStore');

/**
 * The opacity class is responsible for calculating the opacity of a particular
 * node from the data on the node and its parent
 *
 * @constructor {OpacitySystem}
 */
function OpacitySystem () {
    this.pathStore = new PathStore();
}

/**
 * registers a new Opacity for the given path. This opacity will be updated
 * when the OpacitySystem updates.
 *
 * @method registerOpacityAtPath
 *
 * @param {String} path path for the opacity to be registered to.
 * @param {Opacity} [opacity] opacity to register.
 * @return {undefined} undefined
 */
OpacitySystem.prototype.registerOpacityAtPath = function registerOpacityAtPath (path, opacity) {
    if (!PathUtils.depth(path)) return this.pathStore.insert(path, opacity ? opacity : new Opacity());

    var parent = this.pathStore.get(PathUtils.parent(path));

    if (!parent) throw new Error(
            'No parent opacity registered at expected path: ' + PathUtils.parent(path)
    );

    if (opacity) opacity.setParent(parent);

    this.pathStore.insert(path, opacity ? opacity : new Opacity(parent));
};

/**
 * Deregisters a opacity registered at the given path.
 *
 * @method deregisterOpacityAtPath
 * @return {void}
 *
 * @param {String} path at which to register the opacity
 */
OpacitySystem.prototype.deregisterOpacityAtPath = function deregisterOpacityAtPath (path) {
    this.pathStore.remove(path);
};

/**
 * Method which will make the opacity currently stored at the given path a breakpoint.
 * A opacity being a breakpoint means that both a local and world opacity will be calculated
 * for that point. The local opacity being the concatinated opacity of all ancestor opacities up
 * until the nearest breakpoint, and the world being the concatinated opacity of all ancestor opacities.
 * This method throws if no opacity is at the provided path.
 *
 * @method
 *
 * @param {String} path The path at which to turn the opacity into a breakpoint
 *
 * @return {undefined} undefined
 */
OpacitySystem.prototype.makeBreakPointAt = function makeBreakPointAt (path) {
    var opacity = this.pathStore.get(path);
    if (!opacity) throw new Error('No opacity Registered at path: ' + path);
    opacity.setBreakPoint();
};

/**
 * Method that will make the opacity at this location calculate a world opacity.
 *
 * @method
 *
 * @param {String} path The path at which to make the opacity calculate a world matrix
 *
 * @return {undefined} undefined
 */
OpacitySystem.prototype.makeCalculateWorldOpacityAt = function makeCalculateWorldOpacityAt (path) {
        var opacity = this.pathStore.get(path);
        if (!opacity) throw new Error('No opacity opacity at path: ' + path);
        opacity.setCalculateWorldOpacity();
};

/**
 * Returns the instance of the opacity class associated with the given path,
 * or undefined if no opacity is associated.
 *
 * @method
 *
 * @param {String} path The path to lookup
 *
 * @return {Opacity | undefined} the opacity at that path is available, else undefined.
 */
OpacitySystem.prototype.get = function get (path) {
    return this.pathStore.get(path);
};

/**
 * update is called when the opacity system requires an update.
 * It traverses the opacity array and evaluates the necessary opacities
 * in the scene graph with the information from the corresponding node
 * in the scene graph
 *
 * @method update
 * @return {undefined} undefined
 */
OpacitySystem.prototype.update = function update () {
    var opacities = this.pathStore.getItems();
    var paths = this.pathStore.getPaths();
    var opacity;
    var changed;
    var node;
    var components;

    for (var i = 0, len = opacities.length ; i < len ; i++) {
        node = Dispatch.getNode(paths[i]);
        if (!node) continue;
        components = node.getComponents();
        opacity = opacities[i];

        if ((changed = opacity.calculate())) {
            opacityChanged(node, components, opacity);
            if (changed & Opacity.LOCAL_CHANGED) localOpacityChanged(node, components, opacity.getLocalOpacity());
            if (changed & Opacity.WORLD_CHANGED) worldOpacityChanged(node, components, opacity.getWorldOpacity());
        }
    }
};

/**
 * Private method to call when either the Local or World Opacity changes.
 * Triggers 'onOpacityChange' methods on the node and all of the node's components
 *
 * @method
 * @private
 *
 * @param {Node} node the node on which to trigger a change event if necessary
 * @param {Array} components the components on which to trigger a change event if necessary
 * @param {Opacity} opacity the opacity class that changed
 *
 * @return {undefined} undefined
 */
function opacityChanged (node, components, opacity) {
    if (node.onOpacityChange) node.onOpacityChange(opacity);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onOpacityChange)
            components[i].onOpacityChange(opacity);
}

/**
 * Private method to call when the local opacity changes. Triggers 'onLocalOpacityChange' methods
 * on the node and all of the node's components
 *
 * @method
 * @private
 *
 * @param {Node} node the node on which to trigger a change event if necessary
 * @param {Array} components the components on which to trigger a change event if necessary
 * @param {Array} opacity the local opacity
 *
 * @return {undefined} undefined
 */
function localOpacityChanged (node, components, opacity) {
    if (node.onLocalOpacityChange) node.onLocalOpacityChange(opacity);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onLocalOpacityChange)
            components[i].onLocalOpacityChange(opacity);
}

/**
 * Private method to call when the world opacity changes. Triggers 'onWorldOpacityChange' methods
 * on the node and all of the node's components
 *
 * @method
 * @private
 *
 * @param {Node} node the node on which to trigger a change event if necessary
 * @param {Array} components the components on which to trigger a change event if necessary
 * @param {Array} opacity the world opacity
 *
 * @return {undefined} undefined
 */
function worldOpacityChanged (node, components, opacity) {
    if (node.onWorldOpacityChange) node.onWorldOpacityChange(opacity);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onWorldOpacityChange)
            components[i].onWorldOpacityChange(opacity);
}

module.exports = new OpacitySystem();
