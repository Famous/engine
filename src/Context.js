var Clock = require('./Clock');
var Node = require('./Node');
var RenderProxy = require('./RenderProxy');

var GLOBAL_DISPATCH = Clock.dispatch;

function Context (selector) {
    this.proxy = new RenderProxy(this);
    this.node = new Node(this.proxy, GLOBAL_DISPATCH);
    this.selector = selector;
    this.dirty = true;
    this.dirtyQueue = [];

    GLOBAL_DISPATCH.message('NEED_SIZE_FOR').message(selector);
    GLOBAL_DISPATCH.targetedOn(selector, 'resize', this._receiveContextSize.bind(this));
    Clock.update(this);
}

Context.prototype.addChild = function addChild () {
    return this.node.addChild();
};

Context.prototype.removeChild = function removeChild (node) {
    this.node.removeChild(node);
    return this;
};

Context.prototype.update = function update () {
    this.node.update();
    return this;
};

Context.prototype.getRenderPath = function getRenderPath () {
    return this.selector;
};

Context.prototype.receive = function receive (command) {
    if (this.dirty) this.dirtyQueue.push(command);
    else GLOBAL_DISPATCH.message(command);
    return this;
};

Context.prototype._receiveContextSize = function _receiveContextSize (sizeReport) {
    this.node
        .getDispatch()
        .getContext()
        .setAbsolute(sizeReport.size[0], sizeReport.size[1], 0);
    if (this.dirty) {
        this.dirty = false;
        for (var i = 0, len = this.dirtyQueue.length ; i < len ; i++) this.receive(this.dirtyQueue.shift());
    }
    return this;
};

module.exports = Context;