
function MockNode (selector, receivedQueue) {
    this.children = [];
    this.selector = selector;
    this.receivedQueue = receivedQueue;
}

MockNode.prototype.getSelector = function getSelector () {
    return this.selector;
};

MockNode.prototype.getChildren = function getChildren () {
    return this.children;
};

MockNode.prototype.addChild = function addChild (receivedQueue) {
    var node = new MockNode(this.selector + '/' + this.children.length, receivedQueue);
    this.children.push(node);
    return node;
};

MockNode.prototype.getLocation = function getLocation () {
    return this.selector;
};

MockNode.prototype.onReceive = function () {
    this.receivedQueue.push(this);
};

module.exports = MockNode;

