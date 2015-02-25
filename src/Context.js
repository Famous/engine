'use strict';

var RenderProxy = require('./RenderProxy');
var RenderNode = require('./RenderNode');

var NEED_SIZE_FOR = 'NEED_SIZE_FOR';
var RESIZE = 'resize';

function Context (model, selector, globalDispatch) {
    this._selector = selector;
    this._renderProxy = new RenderProxy(this);
    this._contextNode = new RenderNode(this._renderProxy, globalDispatch);
    this._drawCommands = [];
    this._globalDispatch = globalDispatch;
    this._contentNode = this._contextNode.addChild();
    this.init(model);
}

Context.prototype.init = function init (model) {
    this._contentNode.getDispatch().acceptModel(model);
    this._globalDispatch.message(NEED_SIZE_FOR).message(this._selector);
    this._globalDispatch.targetedOn(this._selector, RESIZE, this._receiveContextSize.bind(this));
    return this;
};  

Context.prototype.getRenderPath = function () {
    return this._selector;
};

Context.prototype.receive = function receive (command) {
    this._drawCommands.push(command);
    return this;
};

Context.prototype.send = function send () {
    for (var i = 0, len = this._drawCommands.length ; i < len ; i++)
        this._globalDispatch.message(this._drawCommands.shift());
    return this;
};

Context.prototype._receiveContextSize = function _receiveContextSize (sizeReport) {
    this._contextNode._localDispatch._context._size.setAbsolute(sizeReport.size[0], sizeReport.size[1], 0)._update(7, [0, 0, 0]);
    this._needsSizeZero = true;
};

Context.prototype._sizeZero = function _sizeZero() {
    this._contextNode._localDispatch._context._size._update(0, [0, 0, 0]);
    this._needsSizeZero = false;
};

Context.prototype._update = function _update (node, parent) {
    var dispatch = node.getDispatch();
    dispatch.updateModelView()
        .cleanComponents()
        .cleanRenderContext(parent)
        .cleanRenderables(this._renderProxy);
    this._needsReflow = this._needsReflow || dispatch.requestingReflow();
    var children = node.getChildren();
    var i = 0;
    var len = children.length;
    for (; i < len ; i++) this._update(children[i], node);
};

Context.prototype.update = function update (time) {
    if (this._needsReflow) this.reflow();
    this._time = time;
    this._update(this._contentNode, this._contextNode);
    if (this._needsSizeZero) this._sizeZero();
    this._renderProxy.send();
    return this;
};

Context.prototype.reflow = function reflow () {
    this._contextNode.reflow();
    this._needsReflow = false;
    return this;
};

module.exports = Context;

