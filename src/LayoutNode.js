'use strict';

var LocalDispatch = require('./LocalDispatch');
var Position = require('famous-components').Position;
var Rotation = require('famous-components').Rotation;
var Scale = require('famous-components').Scale;
var Align = require('famous-components').Align;
var Origin = require('famous-components').Origin;
var MountPoint = require('famous-components').MountPoint;
var Size = require('famous-components').Size;

function LayoutNode () {
    this._children = [];
    this._localDispatch = new LocalDispatch(this);
    this._pos = new Position(this._localDispatch);
    this._rot = new Rotation(this._localDispatch);
    this._siz = new Size(this._localDispatch);
    this._sca = new Scale(this._localDispatch);
    this._ali = new Align(this._localDispatch);
    this._ori = new Origin(this._localDispatch);
    this._mou = new MountPoint(this._localDispatch);
}

LayoutNode.prototype.halt = function halt () {
    this._pos.halt();
    this._rot.halt();
    this._sca.halt();
    this._ali.halt();
    this._ori.halt();
    this._mou.halt();
    return this;
};

LayoutNode.prototype.addChild = function addChild (child) {
    this._children[0] = child;
    return this;
};

LayoutNode.prototype.removeChild = function removeChild (child) {
    this._children.splice(this._children.indexOf(child), 1);
    return this;
};

LayoutNode.prototype.removeAllChildren = function removeAllChildren () {
    var i = 0;
    var len = this._children.length;
    for (; i < len ; i++) this._children.shift().kill();
};

LayoutNode.prototype.kill = function kill () {
    this._localDispatch.kill();
    this.removeAllChildren();
    return this;
};

LayoutNode.prototype.getDispatch = function getDispatch () {
    return this._localDispatch;
};

LayoutNode.prototype.getChildren = function getChildren () {
    return this._children;
};

LayoutNode.prototype.setPosition = function setPosition (x, y, z, options) {
    this._pos.set(x, y, z, options);
    return this;
};

LayoutNode.prototype.getPosition = function getPosition () {
    return [this._pos._x.get(), this._pos._y.get(), this._pos._z.get()];
};

LayoutNode.prototype.getSize = function getSize () {
    return this._localDispatch._context._size.getTopDownSize();
};

LayoutNode.prototype.setSize = function setSize (x, y, z, options) {
    this._siz.setAbsolute(x, y, z, options);
    return this;
};

LayoutNode.prototype.setRotation = function setRotation (x, y, z, options) {
    this._rot.set(x, y, z, options);
    return this;
};

LayoutNode.prototype.setScale = function setScale (x, y, z, options) {
    this._sca.set(x, y, z, options);
    return this;
};

LayoutNode.prototype.setOrigin = function setOrigin (x, y, z, options) {
    this._ori.set(x, y, z, options);
    return this;
};

LayoutNode.prototype.setAlign = function setAlign (x, y, z, options) {
    this._ali.set(x, y, z, options);
    return this;
};

LayoutNode.prototype.setMountPoint = function setMountPoint (x, y, z, options) {
    this._mou.set(x, y, z, options);
    return this;
};

LayoutNode.prototype.setDifferential = function setDifferential (x, y, z, options) {
    this._siz.setDifferential(x, y, z, options);
    return this;
};

LayoutNode.prototype.setProportions = function setProportions (x, y, z, options) {
    this._siz.setProportional(x, y, z, options);
    return this;
};

module.exports = LayoutNode;
