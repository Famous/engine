'use strict';

var ElementCache = require('./ElementCache');

var TRANSFORM = 'transform';

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

        if (this._target) this._parent.element.removeChild(this._target.element);
        
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
    console.log(width, height);
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

DOMRenderer.prototype.setMatrix = function setMatrix (transform) { 
    this._assertTargetLoaded();
    this.findParent();
    var worldTransform = this._target.worldTransform;
    for (var i = 0 ; i < 16 ; i++) worldTransform[i] = transform[i];

    invert(this._target.invertedParent, this._parent.worldTransform);
    invert(this._target.finalTransform, this._target.invertedParent, worldTransform);
    debugger;
    this._target.element.style[TRANSFORM] = stringifyMatrix(this._target.finalTransform);
};

DOMRenderer.prototype.addClass = function addClass (domClass) {
    this._assertTargetLoaded();
    this._target.element.classList.add(domClass);
};

function stringifyMatrix(m) {
    var r = 'matrix3d(';

    r += (m[0] < 0.000001 && m[0] > -0.000001) ? '0,' : m[0] + ',';
    r += (m[1] < 0.000001 && m[1] > -0.000001) ? '0,' : m[1] + ',';
    r += (m[2] < 0.000001 && m[2] > -0.000001) ? '0,' : m[2] + ',';
    r += (m[3] < 0.000001 && m[3] > -0.000001) ? '0,' : m[3] + ',';
    r += (m[4] < 0.000001 && m[4] > -0.000001) ? '0,' : m[4] + ',';
    r += (m[5] < 0.000001 && m[5] > -0.000001) ? '0,' : m[5] + ',';
    r += (m[6] < 0.000001 && m[6] > -0.000001) ? '0,' : m[6] + ',';
    r += (m[7] < 0.000001 && m[7] > -0.000001) ? '0,' : m[7] + ',';
    r += (m[8] < 0.000001 && m[8] > -0.000001) ? '0,' : m[8] + ',';
    r += (m[9] < 0.000001 && m[9] > -0.000001) ? '0,' : m[9] + ',';
    r += (m[10] < 0.000001 && m[10] > -0.000001) ? '0,' : m[10] + ',';
    r += (m[11] < 0.000001 && m[11] > -0.000001) ? '0,' : m[11] + ',';
    r += (m[12] < 0.000001 && m[12] > -0.000001) ? '0,' : m[12] + ',';
    r += (m[13] < 0.000001 && m[13] > -0.000001) ? '0,' : m[13] + ',';
    r += (m[14] < 0.000001 && m[14] > -0.000001) ? '0,' : m[14] + ',';

    r += m[15] + ')';
    return r;
}

function invert (out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
        return null;
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
}

function multiply (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3],
        b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7],
        b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11],
        b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];

    out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b4; b1 = b5; b2 = b6; b3 = b7;
    out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b8; b1 = b9; b2 = b10; b3 = b11;
    out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b12; b1 = b13; b2 = b14; b3 = b15;
    out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    return out;
}

module.exports = DOMRenderer;

