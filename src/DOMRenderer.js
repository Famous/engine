'use strict';

var ElementCache = require('./ElementCache');
var math = require('./Math');
var vendorPrefix = require('./VendorPrefix');
var eventMap = require('./events/EventMap');

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

    this._boundTriggerEvent = this._triggerEvent.bind(this);

    this._selector = selector;
    
    this._elements = {};

    this._elements[selector] = this._root;

    this.perspectiveTransform = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    this._VPtransform = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

    this._eventListeners = {};

    this._size = [null, null];
}

DOMRenderer.prototype.addEventListener = function addEventListener(path, type, properties, preventDefault) {
    if (!this._eventListeners[type]) {
        this._eventListeners[type] = {};
        if (eventMap[type][1]) {
            // Use event delegation
            this._root.element.addEventListener(type, this._boundTriggerEvent);
        } else {
            // Directly link event handler to DOM element
            this._elements[path].element.addEventListener(type, this._boundTriggerEvent);
        }
    }

    this._eventListeners[type][path] = {
        preventDefault: preventDefault
    };
};

DOMRenderer.prototype._triggerEvent = function _triggerEvent(ev) {
    var evPath = ev.path ? ev.path : _getPath(ev);
    for (var i = 0; i < evPath.length; i++) {
        if (!evPath[i].dataset) continue;
        var path = evPath[i].dataset.faPath;
        if (this._eventListeners[ev.type][path]) {

            ev.stopPropagation();
            if (this._eventListeners[ev.type][path].preventDefault) {
                ev.preventDefault();
            }

            var EventConstructor = eventMap[ev.type][0];
            this._compositor.sendEvent(path, ev.type, new EventConstructor(ev));

            break;
        }
    }
};

function _getPath (ev) {
    var path = [];
    var node = ev.target;
    while (node !== document.body) {
        path.push(node);
        node = node.parentNode;
    }
    return path;
}

DOMRenderer.prototype.getSize = function getSize () {
    this._size[0] = this._root.element.offsetWidth;
    this._size[1] = this._root.element.offsetHeight;
    return this._size;
};

DOMRenderer.prototype._getSize = DOMRenderer.prototype.getSize;

DOMRenderer.prototype.draw = function draw (renderState) {
    if (renderState.perspectiveDirty) {
        this.perspectiveDirty = true;

        this.perspectiveTransform[0] = renderState.perspectiveTransform[0];
        this.perspectiveTransform[1] = renderState.perspectiveTransform[1];
        this.perspectiveTransform[2] = renderState.perspectiveTransform[2];
        this.perspectiveTransform[3] = renderState.perspectiveTransform[3];

        this.perspectiveTransform[4] = renderState.perspectiveTransform[4];
        this.perspectiveTransform[5] = renderState.perspectiveTransform[5];
        this.perspectiveTransform[6] = renderState.perspectiveTransform[6];
        this.perspectiveTransform[7] = renderState.perspectiveTransform[7];

        this.perspectiveTransform[8] = renderState.perspectiveTransform[8];
        this.perspectiveTransform[9] = renderState.perspectiveTransform[9];
        this.perspectiveTransform[10] = renderState.perspectiveTransform[10];
        this.perspectiveTransform[11] = renderState.perspectiveTransform[11];

        this.perspectiveTransform[12] = renderState.perspectiveTransform[12];
        this.perspectiveTransform[13] = renderState.perspectiveTransform[13];
        this.perspectiveTransform[14] = renderState.perspectiveTransform[14];
        this.perspectiveTransform[15] = renderState.perspectiveTransform[15];
    }

    if (renderState.viewDirty || renderState.perspectiveDirty) {
        math.multiply(this._VPtransform, this.perspectiveTransform, renderState.viewTransform);
        this._root.element.style[TRANSFORM] = this._stringifyMatrix(this._VPtransform);
    }
};

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
    this._target.element.style.width = (width === true) ? '' : width + 'px';
    this._target.element.style.height = (height === true) ? '' : height + 'px';
};

DOMRenderer.prototype.setAttribute = function setAttribute (name, value) {
    this._assertTargetLoaded();
    this._target.element.setAttribute(name, value);
};

DOMRenderer.prototype.setContent = function setContent (content) {
    this._assertTargetLoaded();
    this.findChildren();

    // TODO Temporary solution
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
    var changed = false;

    if (transform)
        for (var i = 0, len = 16 ; i < len ; i++) {
            changed = changed ? changed : worldTransform[i] === transform[i];
            worldTransform[i] = transform[i];
        }
    else changed = true;

    if (changed) {
        math.invert(this._target.invertedParent, this._parent.worldTransform);
        math.multiply(this._target.finalTransform, this._target.invertedParent, worldTransform);

        // TODO: this is a temporary fix for draw commands
        // coming in out of order
        var children = this.findChildren([]);
        var previousPath = this._path;
        var previousTarget = this._target;
        for (var i = 0, len = children.length ; i < len ; i++) {
            this._target = children[i];
            this._path = this._target.path;
            this.setMatrix();
        }
        this._path = previousPath;
        this._target = previousTarget;
    }

    this._target.element.style[TRANSFORM] = this._stringifyMatrix(this._target.finalTransform);
};

DOMRenderer.prototype.addClass = function addClass (domClass) {
    this._assertTargetLoaded();
    this._target.element.classList.add(domClass);
};

DOMRenderer.prototype.removeClass = function removeClass (domClass) {
    this._assertTargetLoaded();
    this._target.element.classList.remove(domClass);
};

DOMRenderer.prototype._stringifyMatrix = function _stringifyMatrix(m) {
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
};

module.exports = DOMRenderer;

