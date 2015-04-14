'use strict';

var ElementCache = require('./ElementCache');

// an enumeration of potential vendor prefixes.
var VENDOR_PREFIXES = ['', '-ms-', '-webkit-', '-moz-', '-o-'];

/**
 * A private function for determining if a css property
 * has a vendor prefix.
 *
 * @param {String} property
 */
function vendorPrefix(property) {
    for (var i = 0; i < VENDOR_PREFIXES.length; i++) {
        var prefixed = VENDOR_PREFIXES[i] + property;
        if (document.documentElement.style[prefixed] === '') {
            return prefixed;
        }
    }
    return property;
}

// the prefixed transform property.
var TRANSFORM = vendorPrefix('transform');

/**
 * DOMRenderer is a class responsible for adding elements
 * to the DOM and writing to those elements.
 * there is a DOMRenderer per context, represented as an
 * element and a selector. It is instantiated in the 
 * context class.
 *
 * @class DOMRenderer
 * 
 * @param {HTMLElement} an element.
 * @param {String} the selector of the element.
 * @param {Compositor}
 */
function DOMRenderer (element, selector, compositor) {
    this._compositor = compositor; // a reference to the compositor

    this._target = null; // a register for holding the current
                         // element that the Renderer is operating
                         // upon

    this._parent = null; // a register for holding the parent
                         // of the target

    this._path = null; // a register for holding the path of the target
                       // this register must be set first, and then
                       // children, target, and parent are all looked
                       // up from that.

    this._children = []; // a register for holding the children of the
                         // current target.

    this._root = new ElementCache(element, selector); // the root
                                                      // of the dom tree that this
                                                      // renderer is responsible
                                                      // for

    this._selector = selector;
    
    this._elements = {};

    this._elements[selector] = this._root;

    this._eventListeners = {};
}

DOMRenderer.prototype.addEventListener = function addEventListener(path, type, properties, preventDefault) {
    if (!this._eventListeners[type]) {
        this._eventListeners[type] = {};
        this._root.element.addEventListener(type, this._triggerEvent.bind(this));
    }

    this._eventListeners[type][path] = {
        properties: properties,
        preventDefault: preventDefault
    };
};

function _mirror(item, target, reference) {
    var i, len;
    var key, keys;
    if (typeof item === 'string' || typeof item === 'number') target[item] = reference[item];
    else if (Array.isArray(item)) {
        for (i = 0, len = item.length; i < len; i++) {
            _mirror(item[i], target, reference);
        }
    }
    else {
        keys = Object.keys(item);
        for (i = 0, len = keys.length; i < len; i++) {
            key = keys[i];
            if (reference[key]) {
                target[key] = {};
                _mirror(item[key], target[key], reference[key])
            }
        }
    }
}

function _makeTarget (ev) {
    var target = ev.target;
    var result = {
        tagName: target.tagName,
        id: target.getAttribute('id'),
        classes: []
    };
    for (var i = 0, len = target.classList.length ; i < len ; i++)
        result.classes[i] = target.classList[i];
    return result;
}

function _stripEvent (ev, properties, path) {
    var result = {
        path: path,
        target: _makeTarget(ev),
        node: null
    };
    var i, len;
    for (i = 0, len = properties ? properties.length : 0; i < len; i++) {
        var prop = properties[i];
        _mirror(prop, result, ev);
    }
    result.timeStamp = ev.timeStamp;
    result.time = ev.timeStamp;
    switch (ev.type) {
        case 'mousedown':
        case 'mouseup':
        case 'click':
        case 'mousemove':
            result.x = ev.x;
            result.y = ev.y;
            result.timeStamp = ev.timeStamp;
            result.pageX = ev.pageX;
            result.pageY = ev.pageY;
            break;
        case 'wheel':
            result.deltaX = ev.deltaX;
            result.deltaY = ev.deltaY;
            break;
        case 'touchstart':
        case 'touchmove':
        case 'touchend':
           result.targetTouches = [];
           for (var i = 0 ; i < ev.targetTouches.length ; i++) {
               result.targetTouches.push({
                   pageX: ev.targetTouches[i].pageX,
                   pageY: ev.targetTouches[i].pageY,
                   identifier: ev.targetTouches[i].identifier
               });
           }
    }
    
    return result;
}

DOMRenderer.prototype._triggerEvent = function _triggerEvent(ev) {
    var evPath = ev.path ? ev.path : _getPath(ev);
    for (var i = 0; i < evPath.length; i++) {
        if (!evPath[i].dataset) continue;
        var path = evPath[i].dataset.faPath;
        if (this._eventListeners[ev.type][path]) {
            this._compositor.sendEvent(path, ev.type, _stripEvent(ev, this._eventListeners[ev.type][path].properties, path));
            ev.stopPropagation();
            if (this._eventListeners[ev.type][path].preventDefault) {
                ev.preventDefault();
            }
            break;
        }
    }
};

function _getPath (ev) {
    var path = [];
    var node = ev.target;
    while (node != document.body) {
        path.push(node);
        node = node.parentNode;
    }
    return path;
}

DOMRenderer.prototype.getSize = function getSize () {
    return [this._root.element.offsetWidth, this._root.element.offsetHeight];
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

DOMRenderer.prototype.findChildren = function findChildren (array) {
    this._assertPathLoaded();
    
    var path = this._path;
    var keys = Object.keys(this._elements);
    var i = 0;
    var len;
    array = array ? array : this._children;

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
        array[i] = this._elements[keys[i]];

    return array;
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
 
        this._target = new ElementCache(document.createElement(tagName), this._path);
        this._parent.element.appendChild(this._target.element);
        this._elements[this._path] = this._target;
        
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
    if (width != null && width !== true) this._target.element.style.width = width + 'px';
    if (height != null && height !== true) this._target.element.style.height = height + 'px';
};

DOMRenderer.prototype.setAttribute = function setAttribute (name, value) {
    this._assertTargetLoaded();
    this._target.element.setAttribute(name, value);
};

DOMRenderer.prototype.setContent = function setContent (content) {
    this._assertTargetLoaded();
    this.findChildren(this._path);

    // Temporary solution
    for (var i = 0 ; i < this._children.length ; i++) {
        this._target.element.removeChild(this._children[i].element);
    }

    this._target.element.innerHTML = content;

    for (var i = 0 ; i < this._children.length ; i++)
        this._target.element.appendChild(this._children[i].element);
};

DOMRenderer.prototype.setMatrix = function setMatrix (transform) { 
    this._assertTargetLoaded();
    this.findParent();
    var worldTransform = this._target.worldTransform;
    var changed = false

    if (transform)
        for (var i = 0, len = 16 ; i < len ; i++) {
            changed = changed ? changed : worldTransform[i] === transform[i];
            worldTransform[i] = transform[i];
        }
    else changed = true;

    if (changed) {
        invert(this._target.invertedParent, this._parent.worldTransform);
        multiply(this._target.finalTransform, this._target.invertedParent, worldTransform);

        // TODO: this is a temporary fix for draw commands
        // coming in out of order
        var children = this.findChildren([]);
        var previousPath = this._path;
        var previousTarget = this._target;
        for (i = 0, len = children.length ; i < len ; i++) {
            this._target = children[i];
            this._path = this._target.path;
            this.setMatrix();
        }
        this._path = previousPath;
        this._target = previousTarget;
    }

    this._target.element.style[TRANSFORM] = stringifyMatrix(this._target.finalTransform);
};

DOMRenderer.prototype.addClass = function addClass (domClass) {
    this._assertTargetLoaded();
    this._target.element.classList.add(domClass);
};

DOMRenderer.prototype.removeClass = function removeClass (domClass) {
    this._assertTargetLoaded();
    this._target.element.classList.remove(domClass);
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

    var changed = false;
    var out0, out1, out2, out3;

    out0 = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out1 = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out2 = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out3 = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    changed = changed ?
              changed : out0 == out[0] ||
                        out1 == out[1] ||
                        out2 == out[2] ||
                        out3 == out[3];

    out[0] = out0;
    out[1] = out1;
    out[2] = out2;
    out[3] = out3;

    b0 = b4; b1 = b5; b2 = b6; b3 = b7;
    out0 = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out1 = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out2 = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out3 = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    changed = changed ?
              changed : out0 == out[4] ||
                        out1 == out[5] ||
                        out2 == out[6] ||
                        out3 == out[7];

    out[4] = out0;
    out[5] = out1;
    out[6] = out2;
    out[7] = out3;

    b0 = b8; b1 = b9; b2 = b10; b3 = b11;
    out0 = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out1 = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out2 = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out3 = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    changed = changed ?
              changed : out0 == out[8] ||
                        out1 == out[9] ||
                        out2 == out[10] ||
                        out3 == out[11];

    out[8] = out0;
    out[9] = out1;
    out[10] = out2;
    out[11] = out3;

    b0 = b12; b1 = b13; b2 = b14; b3 = b15;
    out0 = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out1 = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out2 = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out3 = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    changed = changed ?
              changed : out0 == out[12] ||
                        out1 == out[13] ||
                        out2 == out[14] ||
                        out3 == out[15];

    out[12] = out0;
    out[13] = out1;
    out[14] = out2;
    out[15] = out3;

    return out;
}

module.exports = DOMRenderer;

