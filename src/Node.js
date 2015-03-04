'use strict';

var LocalDispatch = require('./LocalDispatch');

function Node (proxy, globalDispatch, localDispatch) {
    this._localDispatch = localDispatch != null ? localDispatch : new LocalDispatch(this, proxy);
    this._globalDispatch = globalDispatch;
    this._children = [];
}

Node.prototype.addChild = function addChild (index) {
    var child = new this.constructor(this._localDispatch.getRenderProxy(), this._globalDispatch);
    if (index == null) this._children.push(child);
    else this._children.splice(index, 0, child);
    return child;
};

Node.prototype.removeChild = function removeChild (node) {
    var index = this._children.indexOf(node);
    if (index !== -1) {
        var result = this._children.splice(index, 1);
        result[0].kill();
    }
    return this;
};

Node.prototype.removeChildAtIndex = function removeChildAtIndex (index) {
    var result = this._layoutNodes.splice(index, 1);
    if (result.length) result[0].kill();
    return this;
};

Node.prototype.removeAllChildren = function removeAllChildren () {
    for (var i = 0, len = this._children.length ; i < len ; i++) {
        this._children.pop().kill();
    }
    return this;
};

Node.prototype.kill = function kill () {
    this._localDispatch.kill();
    this.removeAllChildren();
    return this;
};

Node.prototype.getDispatch = function getDispatch () {
    return this._localDispatch;
};

Node.prototype.getChildren = function getChildren () {
    return this._children;
};

Node.prototype.update = function update (parent) {
    this._localDispatch.update(parent);
    for (var i = 0, len = this._children.length ; i < len ; i++)
        this._children[i].update(this);
    return this;
};

module.exports = Node;
