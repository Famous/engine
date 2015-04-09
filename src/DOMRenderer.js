'use strict';

var ElementCache = require('./ElementCache');

function DOMRenderer (element, selector) {
    this._target = null;
    this._parent = null;
    this._path = null;
    this._children = [];
    this._root = new ElementCache(element);
    this._selector = selector;
    this._elements = {};
    this._elements[selector] = this._root;
}

DOMRenderer.prototype.getSize = function getSize () {
    return [this._root.offsetWidth, this._root.offsetHeight];
};

DOMRenderer.prototype._getSize = DOMRenderer.prototype.getSize;

DOMRenderer.prototype._assertPathLoaded = function _asserPathLoaded () {
    if (!this._path) throw new Error('path not loaded');
};

DOMRenderer.prototype._assertParentLoaded = function _assertParentLoaded () {
    if (!this._parent) throw new Error('parent not loaded');
};

DOMRenderer.prototype._assertChildrenLoaded = function _assertChildrenLoaded () {
    if (!this._children) throw new Error('children not loaded');
};

DOMRenderer.prototype.findParent = function findParent () {
    this._assertPathLoaded();

    var path = this._path;
    var parent;

    while (!parent && path.length) {
        path = path.substring(0, path.lastIndexOf('/'));
        parent = this._elements[path];
    }
    this._parent = parent;
    return parent;
};

DOMRenderer.prototype.findChildren = function findChildren () {
    this._assertPathLoaded();
    
    var path = this._path;
    var keys = Object.keys(this._elements);
    var i = 0;
    var len;

    this._children.length = 0;

    while (i < keys.length) {
        if (keys[i].indexOf(path) === -1 || keys[i] === path) keys.splice(i, 1);
        else i++;
    }
    var currentPath;
    var j = 0;
    for (i = 0 ; i < keys.length ; i++) {
        currentPath = keys[i];
        for (j = 0 ; j < keys.length ; j++) {
            if (i !== j && keys[j].indexOf(currentPath) !== -1) {
                keys.splice(j, 1);
                i--;
            }
        }
    }
    for (i = 0, len = keys.length ; i < len ; i++)
        this._children[i] = this._elements[keys[i]];

    return this._children;
};

DOMRenderer.prototype.findTarget = function findTarget () {
    this._target = this._elements[this._path];
    return this._target;
};

DOMRenderer.prototype.loadPath = function loadPath (path) {
    this._path = path;
    return this._path;
};

DOMRenderer.prototype.insertEl = function insertEl (tagName) {
    if (!this._target ||
         this._target.element.tagName.toLowerCase() === tagName.toLowerCase()) {
        
        this.findParent();
        this.findChildren();
        
        this._assertParentLoaded();
        this._assertChildrenLoaded();

        if (this._target) this._parent.element.removeChild(this._target);
        
        this._target = new ElementCache(document.createElement(tagName));
        this._parent.element.appendChild(this._target.element);
        
        for (var i = 0, len = this._children.length ; i < len ; i++) {
            this._target.element.appendChild(this._children[i].element);
        }
    }
};

DOMRenderer.prototype._assertTargetLoaded = function _assertTargetLoaded () {
    if (!this._target) throw new Error('No target loaded');
};

DOMRenderer.prototype.setProperty = function setProperty (name, value) {
    this._assertTargetLoaded();
    this._target.element.style[name] = value;
};

DOMRenderer.prototype.setSize = function setSize (width, height) {
    this._assertTargetLoaded();
    this._target.element.style.width = width + 'px';
    this._target.element.style.height = height + 'px';
};

DOMRenderer.prototype.setAttribute = function setAttribute (name, value) {
    this._assertTargetLoaded();
    this._target.element.setAttribute(name, value);
};

DOMRenderer.prototype.setContent = function setContent (content) {
    this._assertTargetLoaded();
    this.findChildren(this._path);

    // Temporary solution
    for (var i = 0 ; i < this._children.length ; i++)
        this._target.element.removeChild(this._children[i]);

    this._target.element.innerHTML = content;

    for (var i = 0 ; i < this._children.length ; i++)
        this._target.element.appendChild(this._children[i]);
};

DOMRenderer.prototype.setMatrix = function setMatrix (m00, m01, m02, m03,
                                                      m04, m05, m06, m07,
                                                      m08, m09, m10, m11,
                                                      m12, m13, m14, m15) {
    this._assertTargetLoaded();
    this.findParent();
    var worldTransform = this._target.worldTransform;
    worldTransform[0] = m00; worldTransform[1] = m01; worldTransform[2] = m02;
    worldTransform[3] = m03; worldTransform[4] = m04; worldTransform[5] = m05;
    worldTransform[6] = m06; worldTransform[7] = m07; worldTransform[8] = m08;
    worldTransform[9] = m09; worldTransform[10] = m10; worldTransform[11] = m11;    
    worldTransform[12] = m12; worldTransform[13] = m13; worldTransform[14] = m14;
    worldTransform[15] = m15;

    invert(this._target.invertedParent, this._parent.worldTransform);
    invert(this._target.finalTransform, this._target.invertedParent, worldTransform);

    this._target.element.style[TRANSFORM] = stringifyMatrix(this._target.finalTransform);
};

module.exports = DOMRenderer;

