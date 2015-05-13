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

    this._context = context; // A reference to the context
                             // on which the dispatcher
                             // operates

    this._nodes = {}; // a container for constant time lookup of nodes

    this._queue = []; // The queue is used for two purposes
                      // 1. It is used to list indicies in the
                      //    Nodes path which are then used to lookup
                      //    a node in the scene graph.
                      // 2. It is used to assist dispatching
                      //    such that it is possible to do a breadth first
                      //    traversal of the scene graph.
}

/**
 * Associates a node with a path. Commands issued to this path will be sent to the
 * registered node. Throws if there is already a node registered at that path.
 *
 * @method registerNodeAtPath
 * @return {void}
 *
 * @param {String} path to register the node to.
 * @param {Node} node to register at that path.
 */
Dispatch.prototype.registerNodeAtPath = function registerNodeAtPath (path, node) {
    if (this._nodes[path]) throw new Error('Node already defined at path: ' + path);
    this._nodes[path] = node;
    this.mount(path);
};

/**
 * Ends the association between a node and a path name. Messages sent to that path
 * while there is no node associated with it will throw errors. If the given node
 * is not currently registered to that path, an error is thrown.
 *
 * @method deregisterNodeAtPath
 * @return {void}
 *
 * @param {String} path to remove the node from.
 * @param {Node} node to remove.
 */
Dispatch.prototype.deregisterNodeAtPath = function deregisterNodeAtPath (path, node) {
    if (this._nodes[path] !== node) throw new Error('Node is not registered at this path: ' + path);
    this._nodes[path] = null;
    this.dismount(node, path);
};

/**
 * Enque the children of a node within the dispatcher. Does not clear
 * the dispatchers queue first.
 *
 * @method addChildrenToQueue
 * @return {void}
 *
 * @param {Node} node from which to add children to the queue
 */
Dispatch.prototype.addChildrenToQueue = function addChildrenToQueue (node) {
    var children = node.getChildren();
    var child;
    for (var i = 0, len = children.length ; i < len ; i++) {
        child = children[i];
        if (child) this._queue.push(child);
    }
};

/**
 * Returns the next item in the Dispatch's queue.
 *
 * @method next
 * @return {Node} next node in the queue
 */
Dispatch.prototype.next = function next () {
    return this._queue.shift();
};

/**
 * Returns the next node in the queue, but also adds its children to
 * the end of the queue. Continually calling this method will result
 * in a breadth first traversal of the render tree.
 *
 * @method breadthFirstNext
 * @return {Node} the next node in the traversal.
 */
Dispatch.prototype.breadthFirstNext = function breadthFirstNext () {
    var child = this._queue.shift();
    if (!child) return;
    this.addChildrenToQueue(child);
    return child;
};

/**
 * Calls the onMount method for the node at a given path and
 * properly registers all of that nodes children to their proper
 * paths. Throws if that path doesn't have a node registered as
 * a parent or if there is no node registered at that path.
 *
 * @method mount
 * @return {void}
 *
 * @param {String} path at which to begin mounting
 */
Dispatch.prototype.mount = function mount (path) {
    var node = this._nodes[path];
    var parentPath = PathUtils.parent(path);

    // scenes are their own parents
    var parent = !parentPath ? node : this._nodes[parentPath];
 
    if (!node)
        throw new Error(
                'No node registered to path: ' + path
        );
    if (!parent)
        throw new Error(
                'Parent to path: ' + path + 
                ' doesn\'t exist at expected path: ' + parentPath 
        );

    if (node.onMount) node.onMount(parent, path);
    var children = node.getChildren();

    for (var i = 0, len = children.length ; i < len ; i++)
        this.registerNodeAtPath(children[i], path + '/' + i); 
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

    if (node.onDismount) node.onDismount();
    var children = node.getChildren();

    for (var i = 0, len = children.length ; i < len ; i++)
        this.deregisterNodeAtPath(children[i], path + '/' + i);
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
 * @param {String} path
 */
Dispatch.prototype.show = function show (path) {
    var node = this._nodes[path];

    if (!node)
        throw new Error(
                'No node registered to path: ' + path
        );

    if (node.onShow) node.onShow();

    this.addChildrenToQueue(node);
    var child;

    while ((child = this.breadthFirstNext()))
        this.show(child.getLocation());

};

/**
 * Issues the onHide method to the node registered at the given path,
 * and hides the entire subtree below that node. Throws if no node
 * is registered to this path.
 *
 * @method hide
 * @return {void}
 *
 * @param {String} path
 */
Dispatch.prototype.hide = function hide (path) {
    var node = this._nodes[path];

    if (!node)
        throw new Error(
                'No node registered to path: ' + path
        );

    if (node.onHide) node.onHide();

    this.addChildrenToQueue(node);
    var child;

    while ((child = this.breadthFirstNext()))
        this.hide(child.getLocation());

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

    this._queue.length = 0;
    var path = this._queue;

    _splitTo(location, path);

    for (var i = 0, len = path.length ; i < len ; i++)
        path[i] = this._nodes[path[i]];

    return path[path.length - 1];
};

/**
 * dispatch takes an event name and a payload and dispatches it to the
 * entire scene graph below the node that the dispatcher is on. The nodes
 * receive the events in a breadth first traversal, meaning that parents
 * have the opportunity to react to the event before children.
 *
 * @param {String} path name
 * @param {String} event name
 * @param {Any} payload
 */
Dispatch.prototype.dispatch = function dispatch (path, event, payload) {
    if (!path) throw new Error('dispatch requires a path as it\'s first argument');
    if (!event) throw new Error('dispatch requires an event name as it\'s second argument');

    var node = this._nodes[path];
    if (!node)
        throw new Error('No node registered at path: ' + path);

    this.addChildrenToQueue(node);
    var child;

    while ((child = this.breadthFirstNext())) 
        if (child.onReceive)
            child.onReceive(event, payload);

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

    var queue = this._queue;
    var node;

    Event.call(payload);
    payload.node = this.lookupNode(path); // After this call, the path is loaded into the queue
                                          // (lookUp node doesn't clear the queue after the lookup)

    while (queue.length) {
        node = queue.pop(); // pop nodes off of the queue to move up the ancestor chain.
        if (node.onReceive) node.onReceive(event, payload);
        if (payload.propagationStopped) break;
    }
};

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

module.exports = new Dispatch();

