'use strict';

// TODO: Dispatcher should be generalized so that it can work on any Node
// not just Contexts.


/**
 * The Dispatcher class is used to propogate events down the
 * scene graph.
 *
 * @param {Context} Context on which it operates
 */
function Dispatcher (context) {
    
    this._context = context; // A reference to the context
                             // on which the dispatcher
                             // operates

    this._queue = []; // The queue is used for two purposes
                      // 1. It is used to list indicies in the
                      //    Nodes path which are then used to lookup
                      //    a node in the scene graph.
                      // 2. It is used to assist dispatching
                      //    such that it is possible to do a breadth first
                      //    traversal of the scene graph.
}

Dispatcher.prototype.lookupNode = function lookupNode (location) {
    var path = this._queue;
    _splitTo(location, path);
    if (path[0] !== this._context.getSelector()) return void 0;
    var children = this._context.getChildren();
    path[0] = this._context;
    var child;
    var i = 1;
    while (i < path.length) {
        child = children[path[i]];
        path[i] = child;
        if (child) children = child.getChildren();
        else return void 0;
        i++;
    }
    return child;
};

Dispatcher.prototype.dispatch = function dispatch (event, payload) {
    var queue = this._queue;
    var item;
    var i;
    var len;
    var children;

    queue.length = 0;
    queue.push(this._context);
    
    while (queue.length) {
        item = queue.shift();
        if (item.onReceive) item.onReceive(event, payload);
        children = item.getChildren();
        for (i = 0, len = children.length ; i < len ; i++) queue.push(children[i]);
    }
};

Dispatcher.prototype.dispatchUIEvent = function dispatchUIEvent (path, event, payload) {
    var queue = this._queue;
    var node;

    this.lookupNode(path);
    while (queue.length) {
        node = queue.pop();
        if (node.onReceive) node.onReceive(event, payload);
    }
};

function _splitTo (string, target) {
    target.length = 0;
    var last = 0;
    for (var i = 0, len = string.length ; i < len ; i++) {
        if (string[i] === '/') {
            target.push(string.substring(last, i));
            last = i + 1;
        }
    }
    if (i - last > 0) target.push(string.substring(last, i));
    return target;
}


module.exports = Dispatcher;

