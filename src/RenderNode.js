'use strict';

var LocalDispatch = require('./LocalDispatch');
var LayoutNode = require('./LayoutNode');

function RenderNode (proxy, globalDispatch) {
    this._localDispatch = new LocalDispatch(this, proxy);
    this._globalDispatch = globalDispatch;
    this._layoutNodes = [];
    this._childNodes = [];
}

RenderNode.prototype.addChild = function addChild (index) {
    var layoutNode = new LayoutNode();
    layoutNode._localDispatch.dirtyRenderContext();
    var childNode = new RenderNode(this._localDispatch._renderProxy, this._globalDispatch);
    layoutNode.addChild(childNode);
    if (index == null) {
        this._layoutNodes.push(layoutNode);
        this._childNodes.push(childNode);
    }
    else {
        this._layoutNodes.splice(index, 0, layoutNode);
        this._childNodes.splice(index, 0, childNode);
    }
    return childNode;
};

RenderNode.prototype.reflowWith = function reflowWith (fn, ctx) {
    var i = 0;
    var len = this._layoutNodes.length;
    for (; i < len ; i++) this.layout(i, fn, ctx);
};

RenderNode.prototype.reflow = function reflow () {
    var renderer = this._localDispatch.getRenderer();
    if (renderer) {
        if (renderer.layout)
            this.reflowWith(renderer.layout, renderer);
        for (var i = 0, len = this._childNodes.length ; i < len ; i++)
            this._childNodes[i].reflow();
    }
};

RenderNode.prototype.layout = function layout (i, fn, ctx) {
    this._layoutNodes[i].halt();
    fn.call(ctx, this._layoutNodes[i], this._layoutNodes[i - 1], i);
};

RenderNode.prototype.removeChild = function removeChild (node) {
    var index = this._childNodes.indexOf(node);
    if (index > -1) {
        var result = this._layoutNodes.splice(index, 1);
        result[0].kill();
        this._layoutNodes.splice(index, 1);
    }
    return this;
};

RenderNode.prototype.removeChildAtIndex = function removeChildAtIndex (index) {
    var result = this._layoutNodes.splice(index, 1);
    result[0].kill();
    this._childNodes.splice(index, 1);
    return this;
};

RenderNode.prototype.removeAllChildren = function removeAllChildren () {
    for (var i = 0, len = this._childNodes.length ; i < len ; i++) {
        this._layoutNodes.splice(i, 1)[0].kill();
        this._childNodes.splice(i, 1);
    }
    return this;
};

RenderNode.prototype.kill = function kill () {
    this._localDispatch.kill();
    this.removeAllChildren();
    return this;
};

RenderNode.prototype.getDispatch = function getDispatch () {
    return this._localDispatch;
};

RenderNode.prototype.getChildren = function getChildren () {
    return this._layoutNodes;
};

module.exports = RenderNode;
