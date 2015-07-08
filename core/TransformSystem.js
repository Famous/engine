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
var Transform = require('./Transform');
var Dispatch = require('./Dispatch');
var PathStore = require('./PathStore');

/**
 * The transform class is responsible for calculating the transform of a particular
 * node from the data on the node and its parent
 *
 * @constructor {TransformSystem}
 */
function TransformSystem () {
    this.pathStore = new PathStore();
}

/**
 * registers a new Transform for the given path. This transform will be updated
 * when the TransformSystem updates.
 *
 * @method registerTransformAtPath
 * @return {undefined} undefined
 *
 * @param {String} path for the transform to be registered to.
 * @param {Transform | undefined} transform optional transform to register.
 */
TransformSystem.prototype.registerTransformAtPath = function registerTransformAtPath (path, transform) {
    if (!PathUtils.depth(path))
        return this.pathStore.insert(path, transform ? transform : new Transform());

    var parent = this.pathStore.get(PathUtils.parent(path));

    if (!parent) throw new Error(
            'No parent transform registered at expected path: ' + PathUtils.parent(path)
    );

    if (transform) transform.setParent(parent);

    this.pathStore.insert(path, transform ? transform : new Transform(parent));
};

/**
 * deregisters a transform registered at the given path.
 *
 * @method deregisterTransformAtPath
 * @return {void}
 *
 * @param {String} path at which to register the transform
 */
TransformSystem.prototype.deregisterTransformAtPath = function deregisterTransformAtPath (path) {
    this.pathStore.remove(path);
};

/**
 * Method which will make the transform currently stored at the given path a breakpoint.
 * A transform being a breakpoint means that both a local and world transform will be calculated
 * for that point. The local transform being the concatinated transform of all ancestor transforms up
 * until the nearest breakpoint, and the world being the concatinated transform of all ancestor transforms.
 * This method throws if no transform is at the provided path.
 *
 * @method
 *
 * @param {String} path The path at which to turn the transform into a breakpoint
 *
 * @return {undefined} undefined
 */
TransformSystem.prototype.makeBreakPointAt = function makeBreakPointAt (path) {
    var transform = this.pathStore.get(path);
    if (!transform) throw new Error('No transform Registered at path: ' + path);
    transform.setBreakPoint();
};

/**
 * Method that will make the transform at this location calculate a world matrix.
 *
 * @method
 *
 * @param {String} path The path at which to make the transform calculate a world matrix
 *
 * @return {undefined} undefined
 */
TransformSystem.prototype.makeCalculateWorldMatrixAt = function makeCalculateWorldMatrixAt (path) {
        var transform = this.pathStore.get(path);
        if (!transform) throw new Error('No transform Registered at path: ' + path);
        transform.setCalculateWorldMatrix();
};

/**
 * Returns the instance of the transform class associated with the given path,
 * or undefined if no transform is associated.
 *
 * @method
 * 
 * @param {String} path The path to lookup
 *
 * @return {Transform | undefined} the transform at that path is available, else undefined.
 */
TransformSystem.prototype.get = function get (path) {
    return this.pathStore.get(path);
};

/**
 * update is called when the transform system requires an update.
 * It traverses the transform array and evaluates the necessary transforms
 * in the scene graph with the information from the corresponding node
 * in the scene graph
 *
 * @method update
 *
 * @return {undefined} undefined
 */
TransformSystem.prototype.update = function update () {
    var transforms = this.pathStore.getItems();
    var paths = this.pathStore.getPaths();
    var transform;
    var changed;
    var node;
    var vectors;
    var offsets;
    var components;

    for (var i = 0, len = transforms.length ; i < len ; i++) {
        node = Dispatch.getNode(paths[i]);
        if (!node) continue;
        components = node.getComponents();
        transform = transforms[i];
        vectors = transform.vectors;
        offsets = transform.offsets;
        if (offsets.alignChanged) alignChanged(node, components, offsets);
        if (offsets.mountPointChanged) mountPointChanged(node, components, offsets);
        if (offsets.originChanged) originChanged(node, components, offsets);
        if (vectors.positionChanged) positionChanged(node, components, vectors);
        if (vectors.rotationChanged) rotationChanged(node, components, vectors);
        if (vectors.scaleChanged) scaleChanged(node, components, vectors);
        if ((changed = transform.calculate(node))) {
            transformChanged(node, components, transform);
            if (changed & Transform.LOCAL_CHANGED) localTransformChanged(node, components, transform.getLocalTransform());
            if (changed & Transform.WORLD_CHANGED) worldTransformChanged(node, components, transform.getWorldTransform());
        }
    }
};

// private methods

/**
 * Private method to call when align changes. Triggers 'onAlignChange' methods
 * on the node and all of the node's components
 *
 * @method
 * @private
 *
 * @param {Node} node the node on which to call onAlignChange if necessary
 * @param {Array} components the components on which to call onAlignChange if necessary
 * @param {Object} offsets the set of offsets from the transform
 *
 * @return {undefined} undefined
 */
function alignChanged (node, components, offsets) {
    var x = offsets.align[0];
    var y = offsets.align[1];
    var z = offsets.align[2];
    if (node.onAlignChange) node.onAlignChange(x, y, z);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onAlignChange)
            components[i].onAlignChange(x, y, z);
    offsets.alignChanged = false;
}

/**
 * Private method to call when MountPoint changes. Triggers 'onMountPointChange' methods
 * on the node and all of the node's components
 *
 * @method
 * @private
 *
 * @param {Node} node the node on which to trigger a change event if necessary
 * @param {Array} components the components on which to trigger a change event if necessary
 * @param {Object} offsets the set of offsets from the transform
 *
 * @return {undefined} undefined
 */
function mountPointChanged (node, components, offsets) {
    var x = offsets.mountPoint[0];
    var y = offsets.mountPoint[1];
    var z = offsets.mountPoint[2];
    if (node.onMountPointChange) node.onMountPointChange(x, y, z);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onMountPointChange)
            components[i].onMountPointChange(x, y, z);
    offsets.mountPointChanged = false;
}

/**
 * Private method to call when Origin changes. Triggers 'onOriginChange' methods
 * on the node and all of the node's components
 *
 * @method
 * @private
 *
 * @param {Node} node the node on which to trigger a change event if necessary
 * @param {Array} components the components on which to trigger a change event if necessary
 * @param {Object} offsets the set of offsets from the transform
 *
 * @return {undefined} undefined
 */
function originChanged (node, components, offsets) {
    var x = offsets.origin[0];
    var y = offsets.origin[1];
    var z = offsets.origin[2];
    if (node.onOriginChange) node.onOriginChange(x, y, z);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onOriginChange)
            components[i].onOriginChange(x, y, z);
    offsets.originChanged = false;
}

/**
 * Private method to call when Position changes. Triggers 'onPositionChange' methods
 * on the node and all of the node's components
 *
 * @method
 * @private
 *
 * @param {Node} node the node on which to trigger a change event if necessary
 * @param {Array} components the components on which to trigger a change event if necessary
 * @param {Object} vectors the set of vectors from the transform
 *
 * @return {undefined} undefined
 */
function positionChanged (node, components, vectors) {
    var x = vectors.position[0];
    var y = vectors.position[1];
    var z = vectors.position[2];
    if (node.onPositionChange) node.onPositionChange(x, y, z);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onPositionChange)
            components[i].onPositionChange(x, y, z);
    vectors.positionChanged = false;
}

/**
 * Private method to call when Rotation changes. Triggers 'onRotationChange' methods
 * on the node and all of the node's components
 *
 * @method
 * @private
 *
 * @param {Node} node the node on which to trigger a change event if necessary
 * @param {Array} components the components on which to trigger a change event if necessary
 * @param {Object} vectors the set of vectors from the transform
 *
 * @return {undefined} undefined
 */
function rotationChanged (node, components, vectors) {
    var x = vectors.rotation[0];
    var y = vectors.rotation[1];
    var z = vectors.rotation[2];
    var w = vectors.rotation[3];
    if (node.onRotationChange) node.onRotationChange(x, y, z, w);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onRotationChange)
            components[i].onRotationChange(x, y, z, w);
    vectors.rotationChanged = false;
}

/**
 * Private method to call when Scale changes. Triggers 'onScaleChange' methods
 * on the node and all of the node's components
 *
 * @method
 * @private
 *
 * @param {Node} node the node on which to trigger a change event if necessary
 * @param {Array} components the components on which to trigger a change event if necessary
 * @param {Object} vectors the set of vectors from the transform
 *
 * @return {undefined} undefined
 */
function scaleChanged (node, components, vectors) {
    var x = vectors.scale[0];
    var y = vectors.scale[1];
    var z = vectors.scale[2];
    if (node.onScaleChange) node.onScaleChange(x, y, z);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onScaleChange)
            components[i].onScaleChange(x, y, z);
    vectors.scaleChanged = false;
}

/**
 * Private method to call when either the Local or World Transform changes.
 * Triggers 'onTransformChange' methods on the node and all of the node's components
 *
 * @method
 * @private
 *
 * @param {Node} node the node on which to trigger a change event if necessary
 * @param {Array} components the components on which to trigger a change event if necessary
 * @param {Transform} transform the transform class that changed
 *
 * @return {undefined} undefined
 */
function transformChanged (node, components, transform) {
    if (node.onTransformChange) node.onTransformChange(transform);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onTransformChange)
            components[i].onTransformChange(transform);
}

/**
 * Private method to call when the local transform changes. Triggers 'onLocalTransformChange' methods
 * on the node and all of the node's components
 *
 * @method
 * @private
 *
 * @param {Node} node the node on which to trigger a change event if necessary
 * @param {Array} components the components on which to trigger a change event if necessary
 * @param {Array} transform the local transform
 *
 * @return {undefined} undefined
 */
function localTransformChanged (node, components, transform) {
    if (node.onLocalTransformChange) node.onLocalTransformChange(transform);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onLocalTransformChange)
            components[i].onLocalTransformChange(transform);
}

/**
 * Private method to call when the world transform changes. Triggers 'onWorldTransformChange' methods
 * on the node and all of the node's components
 *
 * @method
 * @private
 *
 * @param {Node} node the node on which to trigger a change event if necessary
 * @param {Array} components the components on which to trigger a change event if necessary
 * @param {Array} transform the world transform
 *
 * @return {undefined} undefined
 */
function worldTransformChanged (node, components, transform) {
    if (node.onWorldTransformChange) node.onWorldTransformChange(transform);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onWorldTransformChange)
            components[i].onWorldTransformChange(transform);
}

module.exports = new TransformSystem();
