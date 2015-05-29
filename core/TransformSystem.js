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
var Layer = require('./Layer');

/**
 * The transform class is responsible for calculating the transform of a particular
 * node from the data on the node and its parent
 *
 * @constructor {TransformSystem}
 */
function TransformSystem () {
    this.layer = new Layer();
}

/**
 * registers a new Transform for the given path. This transform will be updated
 * when the TransformSystem updates.
 *
 * @method registerTransformAtPath
 * @return {void}
 *
 * @param {String} path for the transform to be registered to.
 */
TransformSystem.prototype.registerTransformAtPath = function registerTransformAtPath (path) {
    var parent = this.layer.get(PathUtils.parent(path));
    if (!parent) throw new Error(
            'No parent transform registered at expected path: ' + PathUtils.parent(path)
    );
    this.layer.insert(path, new Transform(parent));
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
    this.layer.remove(path);
};


TransformSystem.prototype.makeBreakPointAt = function makeBreakPointAt (path) {
    var transform = this.layer.get(path);
    if (!transform) throw new Error('No transform Registered at path: ' + path);
    transform.setBreakPoint();
};



TransformSystem.prototype.get = function get (path) {
    return this.layer.get(path);
};



/**
 * onUpdate is called when the transform system requires an update.
 * It traverses the transform array and evaluates the necessary transforms
 * in the scene graph with the information from the corresponding node
 * in the scene graph
 *
 * @method onUpdate
 */
TransformSystem.prototype.onUpdate = function onUpdate () {
    var transforms = this.layer.getItems();
    var paths = this.layer.getPaths();
    var transform;
    var changed;
    var node;
    var vectors;
    var offsets;
    var components;
    var j;
    var len2;

    for (var i = 0, len = transforms.length ; i < len ; i++) {
        node = Dispatch.getNode(paths[i]);
        if (!node) continue;
        components = node.getComponent();
        transform = transforms[i];
        vectors = transform.vectors;
        offsets = transform.offsets;
        if (offsets.alignChanged) alignChanged(node, components, offsets);
        if (offsets.mountPointChanged) mountPointChanged(node, components, offsets);
        if (offsets.originChanged) originChanged(node, components, offsets);
        if (vectors.positionChanged) positionChanged(node, components, position);
        if (vectors.rotationChanged) rotationChanged(node, components, rotation);
        if (vectors.scaleChanged) scaleChanged(node, components, scale);
        if ((changed = transform.from(node))) {
            transformChanged(node, components, transform);
            if (changed & Transform.LOCAL_CHANGED) localTransformChanged(node, components, transform.getLocalTransform());
            if (changed & Transform.WORLD_CHANGED) worldTransformChanged(node, components, transform.getWorldTransform());
        }
    }
};

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

function rotationChanged (node, components, vectors) {
    var x = vectors.rotation[0];
    var y = vectors.rotation[1];
    var z = vectors.rotation[2];
    var w = vectors.rotation[3];
    if (node.onRotationChange) node.onRotationChange(x, y, z, w);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onRotationChange)
            components[i] && components[i].onRotationChange(x, y, z, w);
    vectors.rotationChanged = false;
}

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

function transformChanged (node, components, transform) {
    if (node.onTransformChange) node.onTransformChange();
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onTransformChange)
            components[i].onTransformChange(transform);
}

function localTransformChanged (node, components, transform) {
    if (node.onLocalTransformChange) node.onLocalTransformChange(transform);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onLocalTransformChange)
            components[i].onLocalTransformChange(transform);
}

function worldTransformChanged (node, components, transform) {
    if (node.onWorldTransformChange) node.onWorldTransformChange(transform);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onWorldTransformChange)
            components[i].onWorldTransformChange(transform);
}

module.exports = new TransformSystem();

