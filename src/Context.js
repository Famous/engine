'use strict';

var Node = require('./Node');
var RenderProxy = require('./RenderProxy');

var Famous = require('./Famous');

function Context (selector) {
    this._messageQueue = Famous.getMessageQueue();
    this._globalDispatch = Famous.getGlobalDispatch();
    this._clock = Famous.getClock();

    this._clock.update(this);

    this.proxy = new RenderProxy(this);
    this.node = new Node(this.proxy, this._globalDispatch);
    this.selector = selector;
    this.dirty = true;
    this.dirtyQueue = [];

    this._messageQueue.enqueue('NEED_SIZE_FOR').enqueue(selector);
    this._globalDispatch.targetedOn(selector, 'resize', this._receiveContextSize.bind(this));
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
    else this._messageQueue.enqueue(command);
    return this;
};

Context.prototype._receiveContextSize = function _receiveContextSize (size) {
    this.node
        .getDispatch()
        .getContext()
        .setAbsolute(size[0], size[1], 0);

    if (this.dirty) {
        this.dirty = false;
        for (var i = 0, len = this.dirtyQueue.length ; i < len ; i++) this.receive(this.dirtyQueue.shift());
    }

    return this;
};

module.exports = Context;