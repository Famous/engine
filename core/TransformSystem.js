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

/**
 * The transform class is responsible for calculating the transform of a particular
 * node from the data on the node and its parent
 *
 * @constructor {TransformSystem}
 */
function TransformSystem () {
    this._requestingUpdate = false;
    this._transforms = [];
    this._paths = [];
}

/**
 * Internal method to request an update for the transform system.
 *
 * @method _requestUpdate
 * @protected
 */
TransformSystem.prototype._requestUpdate = function _requestUpdate () {
    if (!this._requestingUpdate) {
        this._requestingUpdate = true;
    }
};

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
    var paths = this._paths;
    var index = paths.indexOf(path);
    if (index !== -1) return;

    var i = 0;
    var targetDepth = PathUtils.depth(path);
    var targetIndex = PathUtils.index(path);

    while (
            paths[i] &&
            targetDepth >= PathUtils.depth(paths[i])
    ) i++;
    paths.splice(i, 0, path);
    var newTransform = new Transform();
    newTransform.setParent(this._transforms[paths.indexOf(PathUtils.parent(path))]);
    this._transforms.splice(i, 0, newTransform);
    if (!this._requestingUpdate) this._requestUpdate();
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
    var paths = this._paths;
    var index = paths.indexOf(path);
    if (index === -1) throw new Error('No transform Registered at path: ' + path);

    this._transforms.splice(index, 1)[0].reset();
    this._paths.splice(index, 1);
};


TransformSystem.prototype.makeBreakPointAt = function makeBreakPointAt (path) {
    var paths = this._paths;
    var index = paths.indexOf(path);
    if (index === -1) throw new Error('No transform Registered at path: ' + path);

    var transform = this._transforms[index];
    transform.setBreakPoint();
};



TransformSystem.prototype.get = function get (path) {
    return this._transforms[this._paths.indexOf(path)];
};

/**
 * Notifies the transform system that the a node's information has changed.
 *
 * @method update
 * @return {void}
 */
TransformSystem.prototype.update = function update () {
    if (!this._requestingUpdate) this._requestUpdate();
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
    var transforms = this._transforms;
    var paths = this._paths;
    var transform;
    var changed;
    var node;

    for (var i = 0, len = transforms.length ; i < len ; i++) {
        node = Dispatch.getNode(paths[i]);
        if (!node) continue;
        transform = transforms[i];
        if ((changed = transform.from(node))) {
            if (node.transformChange) node.transformChange(transform);
            if (
                (changed & Transform.LOCAL_CHANGED) 
                && node.localTransformChange
            ) node.localTransformChange(transform.getLocalTransform());
            if (
                (changed & Transform.WORLD_CHANGED)
                && node.onWorldTransformChange
            ) node.worldTransformChange(transform.getWorldTransform());
        }
    }
};

module.exports = new TransformSystem();

