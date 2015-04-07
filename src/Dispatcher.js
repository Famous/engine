'use strict';

function Dispatcher (context) {
    this._context = context;
    this._queue = [];
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
    return target;
}

module.exports = Dispatcher;

