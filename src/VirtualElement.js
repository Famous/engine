'use strict';

var ElementAllocator = require('./ElementAllocator');

var CHANGE_TRANSFORM = 'CHANGE_TRANSFORM';
var CHANGE_TRANSFORM_ORIGIN = 'CHANGE_TRANSFORM_ORIGIN';
var CHANGE_PROPERTY = 'CHANGE_PROPERTY';
var ADD_CLASS = 'ADD_CLASS';
var REMOVE_CLASS = 'REMOVE_CLASS';
var CHANGE_CONTENT = 'CHANGE_CONTENT';
var ADD_EVENT_LISTENER = 'ADD_EVENT_LISTENER';
var EVENT_PROPERTIES = 'EVENT_PROPERTIES';
var EVENT_END = 'EVENT_END';
var RECALL = 'RECALL';
var WITH = 'WITH';
var DRAW = 'DRAW';

var DIV = 'div';
var TRANSFORM = 'transform';
var TRANSFORM_ORIGIN = 'transform-origin';
var FA_SURFACE = 'fa-surface';
var ZERO_COMMA = '0,';
var MATRIX3D = 'matrix3d(';
var COMMA = ',';
var CLOSE_PAREN = ')';

var PERCENT = '%';
var PERCENT_SPACE = '% ';

var vendorPrefixes = ['', '-ms-', '-webkit-', '-moz-', '-o-'];

function vendorPrefix(property) {
    for (var i = 0; i < vendorPrefixes.length; i++) {
        var prefixed = vendorPrefixes[i] + property;
        if (document.documentElement.style[prefixed] === '') {
            return prefixed;
        }
    }
    return property;
}

var VENDOR_TRANSFORM = vendorPrefix(TRANSFORM);
var VENDOR_TRANSFORM_ORIGIN = vendorPrefix(TRANSFORM_ORIGIN);

function VirtualElement (target, path, renderer, parent) {
    this._path = path;
    this._target = target;
    this._renderer = renderer;
    this._parent = parent;
    this._matrix = new Float32Array(16);
    this._invertedParent = [];
    target.classList.add(FA_SURFACE);
    this._allocator = new ElementAllocator(target);
    this._properties = {};
    this._eventListeners = {};
    this._content = '';
    this._children = {};
    this._size = [0, 0, 0];
    this._renderState = null;
}

VirtualElement.prototype.getTarget = function getTarget () {
    return this._target;
};

VirtualElement.prototype.getOrSetElement = function getOrSetElement (path, index) {
    if (this._children[index]) return this._children[index];
    var div = this._allocator.allocate(DIV);
    var child = new VirtualElement(div, path, this._renderer, this);
    this._children[index] = child;
    return child;
};

VirtualElement.prototype.receive = function receive (commands) {
    while (commands.length) {
        var command = commands.shift();
        switch (command) {
        case CHANGE_TRANSFORM:
            this.setMatrix(
                commands.shift(),
                commands.shift(),
                commands.shift(),
                commands.shift(),
                commands.shift(),
                commands.shift(),
                commands.shift(),
                commands.shift(),
                commands.shift(),
                commands.shift(),
                commands.shift(),
                commands.shift(),
                commands.shift(),
                commands.shift(),
                commands.shift(),
                commands.shift()
            );
            break;
        case DRAW:
            this.draw(commands.shift());
            break;
        case CHANGE_TRANSFORM_ORIGIN:
            this.setProperty(VENDOR_TRANSFORM_ORIGIN, stringifyTransformOrigin(commands));
            break;
        case CHANGE_PROPERTY:
            this.setProperty(commands.shift(), commands.shift());
            break;
        case CHANGE_CONTENT:
            this.setContent(commands.shift());
            break;
        case ADD_CLASS:
            this.addClass(commands.shift());
            break;
        case REMOVE_CLASS:
            this.removeClass(commands.shift());
            break;
        case ADD_EVENT_LISTENER:
            var ev = commands.shift();
            var methods;
            var properties;
            var c;
            while ((c = commands.shift()) !== EVENT_PROPERTIES) methods = c;
            while ((c = commands.shift()) !== EVENT_END) properties = c;
            methods = methods || [];
            properties = properties || [];
            this.addEventListener(ev, this.dispatchEvent.bind(this, ev, methods, properties));
            break;
        case RECALL:
            this.setProperty('display', 'none');
            this._parent._allocator.deallocate(this._target);
            break;
        case WITH:
            commands.unshift(command);
            return;
        }
    }
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

function _stripEvent (ev, methods, properties) {
    var result = {};
    var i, len;
    for (i = 0, len = methods.length; i < len; i++) {
        ev[methods[i]]();
    }
    for (i = 0, len = properties.length; i < len; i++) {
        var prop = properties[i];
        _mirror(prop, result, ev);
    }
    switch (ev.type) {
        case 'mousedown':
        case 'mouseup':
        case 'click':
            result.x = ev.x;
            result.y = ev.y;
            result.timeStamp = ev.timeStamp;
            break;
        case 'mousemove':
            result.x = ev.x;
            result.y = ev.y;
            result.movementX = ev.movementX;
            result.movementY = ev.movementY;
            break;
        case 'wheel':
            result.deltaX = ev.deltaX;
            result.deltaY = ev.deltaY;
            break;
    }
    return result;
}

VirtualElement.prototype.dispatchEvent = function (ev, methods, properties, payload) {
    this._renderer.sendEvent(this._path, ev, _stripEvent(payload, methods, properties));
};

VirtualElement.prototype._getSize = function _getSize () {
    this._size[0] = this._target.offsetWidth;
    this._size[1] = this._target.offsetHeight;
    return this._size;
};

VirtualElement.prototype.draw = function draw(renderState) {
    this._renderState = renderState;

    var p = renderState.perspectiveTransform;
    multiply(
        this._matrix,
        this._matrix,
        p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8], p[9], p[10], p[11], p[12], p[13], p[14], p[15]
    );

    this._target.style[VENDOR_TRANSFORM] = stringifyMatrix(this._matrix);
};

VirtualElement.prototype.setMatrix = function setMatrix (m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14, m15) {
    if (this._parent) {
        invert(this._invertedParent, this._parent._matrix);
        multiply(this._matrix, this._invertedParent, m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14, m15);
    } else {
        this._matrix[0] = m0;
        this._matrix[1] = m1;
        this._matrix[2] = m2;
        this._matrix[3] = m3;
        this._matrix[4] = m4;
        this._matrix[5] = m5;
        this._matrix[6] = m6;
        this._matrix[7] = m7;
        this._matrix[8] = m8;
        this._matrix[9] = m9;
        this._matrix[10] = m10;
        this._matrix[11] = m11;
        this._matrix[12] = m12;
        this._matrix[13] = m13;
        this._matrix[14] = m14;
        this._matrix[15] = m15;
    }
};

VirtualElement.prototype.addClass = function addClass (className) {
    this._target.classList.add(className);
};

VirtualElement.prototype.removeClass = function removeClass (className) {
    this._target.classList.remove(className);
};

VirtualElement.prototype.setProperty = function setProperty (key, value) {
    if (this._properties[key] !== value) {
        this._properties[key] = value;
        switch (key) {
            case TRANSFORM:
                var m = value;
                this.setMatrix(m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8], m[9], m[10], m[11], m[12], m[13], m[14], m[15]);
            break;
        default:
            this._target.style[key] = value;
            break;
        }
    }
};

VirtualElement.prototype.setContent = function setContent (content) {
    if (this._content !== content) {
        this._content = content;
        this._target.innerHTML = content;
    }
};

VirtualElement.prototype.addEventListener = function addEventListener (name, cb) {
    if (!this._eventListeners[name]) {
        this._target.addEventListener(name, cb);
    }
};

/**
 * A helper function for serializing a transform its corresponding
 * css string representation.
 *
 * @method stringifyMatrix
 * @private
 *
 * @param {Transform} A sixteen value transform.
 *
 * @return {String} a string of format "matrix3d(m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14, m15)"
 */
function stringifyMatrix(m) {
    var r = MATRIX3D;

    r += (m[0] < 0.000001 && m[0] > -0.000001) ? ZERO_COMMA : m[0] + COMMA;
    r += (m[1] < 0.000001 && m[1] > -0.000001) ? ZERO_COMMA : m[1] + COMMA;
    r += (m[2] < 0.000001 && m[2] > -0.000001) ? ZERO_COMMA : m[2] + COMMA;
    r += (m[3] < 0.000001 && m[3] > -0.000001) ? ZERO_COMMA : m[3] + COMMA;
    r += (m[4] < 0.000001 && m[4] > -0.000001) ? ZERO_COMMA : m[4] + COMMA;
    r += (m[5] < 0.000001 && m[5] > -0.000001) ? ZERO_COMMA : m[5] + COMMA;
    r += (m[6] < 0.000001 && m[6] > -0.000001) ? ZERO_COMMA : m[6] + COMMA;
    r += (m[7] < 0.000001 && m[7] > -0.000001) ? ZERO_COMMA : m[7] + COMMA;
    r += (m[8] < 0.000001 && m[8] > -0.000001) ? ZERO_COMMA : m[8] + COMMA;
    r += (m[9] < 0.000001 && m[9] > -0.000001) ? ZERO_COMMA : m[9] + COMMA;
    r += (m[10] < 0.000001 && m[10] > -0.000001) ? ZERO_COMMA : m[10] + COMMA;
    r += (m[11] < 0.000001 && m[11] > -0.000001) ? ZERO_COMMA : m[11] + COMMA;
    r += (m[12] < 0.000001 && m[12] > -0.000001) ? ZERO_COMMA : m[12] + COMMA;
    r += (m[13] < 0.000001 && m[13] > -0.000001) ? ZERO_COMMA : m[13] + COMMA;
    r += (m[14] < 0.000001 && m[14] > -0.000001) ? ZERO_COMMA : m[14] + COMMA;

    r += m[15] + CLOSE_PAREN;
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

function multiply (out, a, b0, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, b15) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    // Cache only the current line of the second matrix
    var b0  = b0, b1 = b1, b2 = b2, b3 = b3;
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

function stringifyTransformOrigin(commands) {
    return (commands.shift() * 100) + PERCENT_SPACE + (commands.shift() * 100) + PERCENT;
}

module.exports = VirtualElement;
