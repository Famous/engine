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

var Event = require('./Event');
var PathUtils = require('./Path');

/**
 * The Dispatch class is used to propogate events down the
 * scene graph.
 *
 * @class Dispatch
 * @param {Scene} context The context on which it operates
 * @constructor
 */
function Dispatch () {
    this._nodes = {}; // a container for constant time lookup of nodes

                      // The queue is used for two purposes
                      // 1. It is used to list indicies in the
                      //    Nodes path which are then used to lookup
                      //    a node in the scene graph.
                      // 2. It is used to assist dispatching
                      //    such that it is possible to do a breadth first
                      //    traversal of the scene graph.
}

/**
 * Protected method that sets the updater for the dispatch. The updater will
 * almost certainly be the FamousEngine class.
 *
 * @method
 * @protected
 *
 * @param {FamousEngine} updater The updater which will be passed through the scene graph
 *
 * @return {undefined} undefined
 */
Dispatch.prototype._setUpdater = function _setUpdater (updater) {
    this._updater = updater;

    for (var key in this._nodes) this._nodes[key]._setUpdater(updater);
};

/**
 * Calls the onMount method for the node at a given path and
 * properly registers all of that nodes children to their proper
 * paths. Throws if that path doesn't have a node registered as
 * a parent or if there is no node registered at that path.
 *
 * @method mount
 *
 * @param {String} path at which to begin mounting
 * @param {Node} node the node that was mounted
 *
 * @return {void}
 */
Dispatch.prototype.mount = function mount (path, node) {
    if (!node) throw new Error('Dispatch: no node passed to mount at: ' + path);
    if (this._nodes[path])
        throw new Error('Dispatch: there is a node already registered at: ' + path);

    node._setUpdater(this._updater);
    this._nodes[path] = node;
    var parentPath = PathUtils.parent(path);

    // scenes are their own parents
    var parent = !parentPath ? node : this._nodes[parentPath];

    if (!parent)
        throw new Error(
                'Parent to path: ' + path +
                ' doesn\'t exist at expected path: ' + parentPath
        );

    var children = node.getChildren();
    var components = node.getComponents();
    var i;
    var len;

    if (parent.isMounted()) node._setMounted(true, path);
    if (parent.isShown()) node._setShown(true);

    if (parent.isMounted()) {
        node._setParent(parent);
        if (node.onMount) node.onMount(path);

        for (i = 0, len = components.length ; i < len ; i++)
            if (components[i] && components[i].onMount)
                components[i].onMount(node, i);

        for (i = 0, len = children.length ; i < len ; i++)
            if (children[i] && children[i].mount) children[i].mount(path + '/' + i);
            else if (children[i]) this.mount(path + '/' + i, children[i]);
    }

    if (parent.isShown()) {
        if (node.onShow) node.onShow();
        for (i = 0, len = components.length ; i < len ; i++)
            if (components[i] && components[i].onShow)
                components[i].onShow();
    }
};

/**
 * Calls the onDismount method for the node at a given path
 * and deregisters all of that nodes children. Throws if there
 * is no node registered at that path.
 *
 * @method dismount
 * @return {void}
 *
 * @param {String} path at which to begin dismounting
 */
Dispatch.prototype.dismount = function dismount (path) {
    var node = this._nodes[path];

    if (!node)
        throw new Error(
                'No node registered to path: ' + path
        );

    var children = node.getChildren();
    var components = node.getComponents();
    var i;
    var len;

    if (node.isShown()) {
        node._setShown(false);
        if (node.onHide) node.onHide();
        for (i = 0, len = components.length ; i < len ; i++)
            if (components[i] && components[i].onHide)
                components[i].onHide();
    }

    if (node.isMounted()) {
        if (node.onDismount) node.onDismount(path);

        for (i = 0, len = children.length ; i < len ; i++)
            if (children[i] && children[i].dismount) children[i].dismount();
            else if (children[i]) this.dismount(path + '/' + i);

        for (i = 0, len = components.length ; i < len ; i++)
            if (components[i] && components[i].onDismount)
                components[i].onDismount();

        node._setMounted(false);
        node._setParent(null);
    }

    this._nodes[path] = null;
};

/**
 * Returns a the node registered to the given path, or none
 * if no node exists at that path.
 *
 * @method getNode
 * @return {Node | void} node at the given path
 *
 * @param {String} path at which to look up the node
 */
Dispatch.prototype.getNode = function getNode (path) {
    return this._nodes[path];
};

/**
 * Issues the onShow method to the node registered at the given path,
 * and shows the entire subtree below that node. Throws if no node
 * is registered to this path.
 *
 * @method show
 * @return {void}
 *
 * @param {String} path the path of the node to show
 */
Dispatch.prototype.show = function show (path) {
    var node = this._nodes[path];

    if (!node)
        throw new Error(
                'No node registered to path: ' + path
        );

    if (node.onShow) node.onShow();

    var components = node.getComponents();
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onShow)
            components[i].onShow();

    var queue = allocQueue();

    addChildrenToQueue(node, queue);
    var child;

    while ((child = breadthFirstNext(queue)))
        this.show(child.getLocation());

    deallocQueue(queue);
};

/**
 * Issues the onHide method to the node registered at the given path,
 * and hides the entire subtree below that node. Throws if no node
 * is registered to this path.
 *
 * @method hide
 * @return {void}
 *
 * @param {String} path the path of the node to hide
 */
Dispatch.prototype.hide = function hide (path) {
    var node = this._nodes[path];

    if (!node)
        throw new Error(
                'No node registered to path: ' + path
        );

    if (node.onHide) node.onHide();

    var components = node.getComponents();
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onHide)
            components[i].onHide();

    var queue = allocQueue();

    addChildrenToQueue(node, queue);
    var child;

    while ((child = breadthFirstNext(queue)))
        this.hide(child.getLocation());

    deallocQueue(queue);
};

/**
 * lookupNode takes a path and returns the node at the location specified
 * by the path, if one exists. If not, it returns undefined.
 *
 * @param {String} location The location of the node specified by its path
 *
 * @return {Node | undefined} The node at the requested path
 */
Dispatch.prototype.lookupNode = function lookupNode (location) {
    if (!location) throw new Error('lookupNode must be called with a path');

    var path = allocQueue();

    _splitTo(location, path);

    for (var i = 0, len = path.length ; i < len ; i++)
        path[i] = this._nodes[path[i]];

    path.length = 0;
    deallocQueue(path);

    return path[path.length - 1];
};

/**
 * dispatch takes an event name and a payload and dispatches it to the
 * entire scene graph below the node that the dispatcher is on. The nodes
 * receive the events in a breadth first traversal, meaning that parents
 * have the opportunity to react to the event before children.
 *
 * @param {String} path path of the node to send the event to
 * @param {String} event name of the event
 * @param {Any} payload data associated with the event
 *
 * @return {undefined} undefined
 */
Dispatch.prototype.dispatch = function dispatch (path, event, payload) {
    if (!path) throw new Error('dispatch requires a path as it\'s first argument');
    if (!event) throw new Error('dispatch requires an event name as it\'s second argument');

    var node = this._nodes[path];

    if (!node) return;

    payload.node = node;

    var queue = allocQueue();
    queue.push(node);

    var child;
    var components;
    var i;
    var len;

    while ((child = breadthFirstNext(queue))) {
        if (child && child.onReceive)
            child.onReceive(event, payload);

        components = child.getComponents();

        for (i = 0, len = components.length ; i < len ; i++)
            if (components[i] && components[i].onReceive)
                components[i].onReceive(event, payload);
    }

    deallocQueue(queue);
};

/**
 * dispatchUIevent takes a path, an event name, and a payload and dispatches them in
 * a manner anologous to DOM bubbling. It first traverses down to the node specified at
 * the path. That node receives the event first, and then every ancestor receives the event
 * until the context.
 *
 * @param {String} path the path of the node
 * @param {String} event the event name
 * @param {Any} payload the payload
 *
 * @return {undefined} undefined
 */
Dispatch.prototype.dispatchUIEvent = function dispatchUIEvent (path, event, payload) {
    if (!path) throw new Error('dispatchUIEvent needs a valid path to dispatch to');
    if (!event) throw new Error('dispatchUIEvent needs an event name as its second argument');
    var node;

    Event.call(payload);
    node = this.getNode(path);
    if (node) {
        var parent;
        var components;
        var i;
        var len;

        payload.node = node;

        while (node) {
            if (node.onReceive) node.onReceive(event, payload);
            components = node.getComponents();

            for (i = 0, len = components.length ; i < len ; i++)
                if (components[i] && components[i].onReceive)
                    components[i].onReceive(event, payload);

            if (payload.propagationStopped) break;
            parent = node.getParent();
            if (parent === node) return;
            node = parent;
        }
    }
};

var queues = [];

/**
 * Helper method used for allocating a new queue or reusing a previously freed
 * one if possible.
 *
 * @private
 *
 * @return {Array} allocated queue.
 */
function allocQueue() {
    return queues.pop() || [];
}

/**
 * Helper method used for freeing a previously allocated queue.
 *
 * @private
 *
 * @param  {Array} queue    the queue to be relased to the pool.
 * @return {undefined}      undefined
 */
function deallocQueue(queue) {
    queues.push(queue);
}

/**
 * _splitTo is a private method which takes a path and splits it at every '/'
 * pushing the result into the supplied array. This is a destructive change.
 *
 * @private
 * @param {String} string the specified path
 * @param {Array} target the array to which the result should be written
 *
 * @return {Array} the target after having been written to
 */
function _splitTo (string, target) {
    target.length = 0; // clears the array first.
    var last = 0;
    var i;
    var len = string.length;

    for (i = 0 ; i < len ; i++) {
        if (string[i] === '/') {
            target.push(string.substring(last, i));
            last = i + 1;
        }
    }

    if (i - last > 0) target.push(string.substring(last, i));

    return target;
}

/**
 * Enque the children of a node within the dispatcher. Does not clear
 * the dispatchers queue first.
 *
 * @method addChildrenToQueue
 *
 * @param {Node} node from which to add children to the queue
 * @param {Array} queue the queue used for retrieving the new child from
 *
 * @return {void}
 */
function addChildrenToQueue (node, queue) {
    var children = node.getChildren();
    var child;
    for (var i = 0, len = children.length ; i < len ; i++) {
        child = children[i];
        if (child) queue.push(child);
    }
}

/**
 * Returns the next node in the queue, but also adds its children to
 * the end of the queue. Continually calling this method will result
 * in a breadth first traversal of the render tree.
 *
 * @method breadthFirstNext
 * @param {Array} queue the queue used for retrieving the new child from
 * @return {Node | undefined} the next node in the traversal if one exists
 */
function breadthFirstNext (queue) {
    var child = queue.shift();
    if (!child) return void 0;
    addChildrenToQueue(child, queue);
    return child;
}


module.exports = new Dispatch();
