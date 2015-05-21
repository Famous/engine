/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var WebGLRenderer = require('../webgl-renderers/WebGLRenderer');
var Camera = require('../components/Camera');
var DOMRenderer = require('../dom-renderers/DOMRenderer');
var Commands = require('../core/Commands');
require('./styles.css');

/**
 * Context is a render layer with its own WebGLRenderer and DOMRenderer.
 * It is the interface between the Compositor which receives commands
 * and the renderers that interpret them. It also relays information to
 * the renderers about resizing.
 *
 * The DOMElement at the given query selector is used as the root. A
 * new DOMElement is appended to this root element, and used as the
 * parent element for all Famous DOM rendering at this context. A
 * canvas is added and used for all WebGL rendering at this context.
 *
 * @class Context
 * @constructor
 *
 * @param {String} selector Query selector used to locate root element of
 * context layer.
 * @param {Compositor} compositor Compositor reference to pass down to
 * WebGLRenderer.
 *
 * @return {undefined} undefined
 */
function Context(el, selector, compositor) {
    this._rootEl = el;
    this._selector = selector;
    this._compositor = compositor;

    // Create DOM element to be used as root for all famous DOM
    // rendering and append element to the root element.

    var DOMLayerEl = document.createElement('div');
    this._rootEl.appendChild(DOMLayerEl);

    this.WebGLRenderer = null;
    this._canvasEl = null;

    // State holders

    this._renderState = {
        projectionType: Camera.ORTHOGRAPHIC_PROJECTION,
        perspectiveTransform: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
        viewTransform: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
        viewDirty: false,
        perspectiveDirty: false
    };

    this._size = [];
    this._children = {};
    this._elementHash = {};

    this._meshTransform = new Float32Array(16);
    this._meshSize = [0, 0, 0];

    this._commandCallbacks = [];

    this.initCommandCallbacks();
    this.updateSize();
}

/**
 * Queries DOMRenderer size and updates canvas size. Relays size information to
 * WebGLRenderer.
 *
 * @return {Context} this
 */
Context.prototype.updateSize = function () {
    var newSize = this.DOMRenderer.getSize();
    this._compositor.sendResize(this._selector, newSize);

    if (this.canvas && this.WebGLRenderer) {
        this.WebGLRenderer.updateSize(newSize);
    }

    return this;
};

/**
 * Draw function called after all commands have been handled for current frame.
 * Issues draw commands to all renderers with current renderState.
 *
 * @method
 *
 * @return {undefined} undefined
 */
Context.prototype.draw = function draw() {
    this.DOMRenderer.draw(this._renderState);
    if (this.WebGLRenderer) this.WebGLRenderer.draw(this._renderState);

    if (this._renderState.perspectiveDirty) this._renderState.perspectiveDirty = false;
    if (this._renderState.viewDirty) this._renderState.viewDirty = false;
};

/**
 * Gets the size of the parent element of the DOMRenderer for this context.
 *
 * @method
 *
 * @return {undefined} undefined
 */
Context.prototype.getRootSize = function getRootSize() {
    return this.DOMRenderer.getSize();
};

Context.prototype.initCommandCallbacks = function initCommandCallbacks () {
    this._commandCallbacks[Commands.INIT_DOM] = initDOM;
    this._commandCallbacks[Commands.DOM_RENDER_SIZE] = domRenderSize;
    this._commandCallbacks[Commands.CHANGE_TRANSFORM] = changeTransform;
    this._commandCallbacks[Commands.CHANGE_SIZE] = changeSize;
    this._commandCallbacks[Commands.CHANGE_PROPERTY] = changeProperty;
    this._commandCallbacks[Commands.CHANGE_CONTENT] = changeContent;
    this._commandCallbacks[Commands.CHANGE_ATTRIBUTE] = changeAttribute;
    this._commandCallbacks[Commands.ADD_CLASS] = addClass;
    this._commandCallbacks[Commands.REMOVE_CLASS] = removeClass;
    this._commandCallbacks[Commands.SUBSCRIBE] = subscribe;
    this._commandCallbacks[Commands.GL_SET_DRAW_OPTIONS] = glSetDrawOptions;
    this._commandCallbacks[Commands.GL_AMBIENT_LIGHT] = glAmbientLight;
    this._commandCallbacks[Commands.GL_LIGHT_POSITION] = glLightPosition;
    this._commandCallbacks[Commands.GL_LIGHT_COLOR] = glLightColor;
    this._commandCallbacks[Commands.MATERIAL_INPUT] = materialInput;
    this._commandCallbacks[Commands.GL_SET_GEOMETRY] = glSetGeometry;
    this._commandCallbacks[Commands.GL_UNIFORMS] = glUniforms;
    this._commandCallbacks[Commands.GL_BUFFER_DATA] = glBufferData;
    this._commandCallbacks[Commands.GL_CUTOUT_STATE] = glCutoutState;
    this._commandCallbacks[Commands.GL_MESH_VISIBILITY] = glMeshVisibility;
    this._commandCallbacks[Commands.GL_REMOVE_MESH] = glRemoveMesh;
    this._commandCallbacks[Commands.PINHOLE_PROJECTION] = pinholeProjection;
    this._commandCallbacks[Commands.ORTHOGRAPHIC_PROJECTION] = orthographicProjection;
    this._commandCallbacks[Commands.CHANGE_VIEW_TRANSFORM] = changeViewTransform;
}

/**
 * Handles initialization of WebGLRenderer when necessary, including creation
 * of the canvas element and instantiation of the renderer. Also updates size
 * to pass size information to the renderer.
 *
 * @method
 *
 * @return {undefined} undefined
 */
Context.prototype.initWebGL = function initWebGL() {
    this._canvasEl = document.createElement('canvas');
    this._rootEl.appendChild(this._canvasEl);
    this.WebGLRenderer = new WebGLRenderer(this._canvasEl, this._compositor);
    this.updateSize();
};


/**
 * Handles delegation of commands to renderers of this context.
 *
 * @method
 *
 * @param {String} path String used as identifier of a given node in the
 * scene graph.
 * @param {Array} commands List of all commands from this frame.
 * @param {Number} iterator Number indicating progress through the command
 * queue.
 *
 * @return {Number} iterator indicating progress through the command queue.
 */
Context.prototype.receive = function receive(path, commands, iterator) {
    var localIterator = iterator;

    var command = commands[++localIterator];
    this.DOMRenderer.loadPath(path);
    this.DOMRenderer.findTarget();
    while (command != null) {
        if (command === Commands.WITH) return localIterator - 1;
        else localIterator = this._commandCallbacks[command](this, path, commands, localIterator) + 1; 
        command = commands[localIterator];
    }

    return localIterator;
};

// Command Callbacks

function initDOM (context, path, commands, iterator) {
    context.DOMRenderer.insertEl(commands[++iterator]);
    return iterator;
}

function domRenderSize (context, path, commands, iterator) {
    context.DOMRenderer.getSizeOf(commands[++iterator]);
    return iterator;
}

function changeTransform (context, path, commands, iterator) {
    var temp = context._meshTransform;

    temp[0] = commands[++iterator];
    temp[1] = commands[++iterator];
    temp[2] = commands[++iterator];
    temp[3] = commands[++iterator];
    temp[4] = commands[++iterator];
    temp[5] = commands[++iterator];
    temp[6] = commands[++iterator];
    temp[7] = commands[++iterator];
    temp[8] = commands[++iterator];
    temp[9] = commands[++iterator];
    temp[10] = commands[++iterator];
    temp[11] = commands[++iterator];
    temp[12] = commands[++iterator];
    temp[13] = commands[++iterator];
    temp[14] = commands[++iterator];
    temp[15] = commands[++iterator];

    context.DOMRenderer.setMatrix(temp);
    
    if (context.WebGLRenderer)
        context.WebGLRenderer.setCutoutUniform(path, 'u_transform', temp);

    return iterator;
}

function changeSize (context, path, commands, iterator) {
    var width = commands[++iterator];
    var height = commands[++iterator];

    context.DOMRenderer.setSize(width, height);
    if (context.WebGLRenderer) {
        context._meshSize[0] = width;
        context._meshSize[1] = height;
        context.WebGLRenderer.setCutoutUniform(path, 'u_size', context._meshSize);
    }
    
    return iterator;
}

function changeProperty (context, path, commands, iterator) {
    if (context.WebGLRenderer) context.WebGLRenderer.getOrSetCutout(path);
    context.DOMRenderer.setProperty(commands[++iterator], commands[++iterator]);
    return iterator;
}

function changeContent (context, path, commands, iterator) {
    if (context.WebGLRenderer) context.WebGLRenderer.getOrSetCutout(path);
    context.DOMRenderer.setContent(commands[++iterator]);
    return iterator;
}
  
function changeAttribute (context, path, commands, iterator) {
    if (context.WebGLRenderer) context.WebGLRenderer.getOrSetCutout(path);
    context.DOMRenderer.setAttribute(commands[++iterator], commands[++iterator]);
    return iterator;
}

function addClass (context, path, commands, iterator) {
    if (context.WebGLRenderer) context.WebGLRenderer.getOrSetCutout(path);
    context.DOMRenderer.addClass(commands[++iterator]);
    return iterator;
}

function removeClass (context, path, commands, iterator) {
    if (context.WebGLRenderer) context.WebGLRenderer.getOrSetCutout(path);
    context.DOMRenderer.removeClass(commands[++iterator]);
    return iterator;
}

function subscribe (context, path, commands, iterator) {
    if (context.WebGLRenderer) context.WebGLRenderer.getOrSetCutout(path);
    context.DOMRenderer.subscribe(commands[++iterator], commands[++iterator]);
    return iterator;
}

function glSetDrawOptions (context, path, commands, iterator) {
    if (!context.WebGLRenderer) context.initWebGL();
    context.WebGLRenderer.setMeshOptions(path, commands[++iterator]);
    return iterator;
}

function glAmbientLight (context, path, commands, iterator) {
    if (!context.WebGLRenderer) context.initWebGL();
    context.WebGLRenderer.setAmbientLightColor(
        path,
        commands[++iterator],
        commands[++iterator],
        commands[++iterator]
    );
    return iterator;
}

function glLightPosition (context, path, commands, iterator) {
    if (!context.WebGLRenderer) context.initWebGL();
    context.WebGLRenderer.setLightPosition(
        path,
        commands[++iterator],
        commands[++iterator],
        commands[++iterator]
    );
    return iterator;
}

function glLightColor (context, path, commands, iterator) {
    if (!context.WebGLRenderer) context.initWebGL();
    context.WebGLRenderer.setLightColor(
        path,
        commands[++iterator],
        commands[++iterator],
        commands[++iterator]
    );
    return iterator;
}

function materialInput (context, path, commands, iterator) {
    if (!context.WebGLRenderer) context.initWebGL();
    context.WebGLRenderer.handleMaterialInput(
        path,
        commands[++iterator],
        commands[++iterator]
    );
    return iterator;
}

function glSetGeometry (context, path, commands, iterator) {
    if (!context.WebGLRenderer) context.initWebGL();
    context.WebGLRenderer.setGeometry(
        path,
        commands[++iterator],
        commands[++iterator],
        commands[++iterator]
    );
    return iterator;
}

function glUniforms (context, path, commands, iterator) {
    if (!context.WebGLRenderer) context.initWebGL();
    context.WebGLRenderer.setMeshUniform(
        path,
        commands[++iterator],
        commands[++iterator]
    );
    return iterator;
}

function glBufferData (context, path, commands, iterator) {
    if (!context.WebGLRenderer) context.initWebGL();
    context.WebGLRenderer.bufferData(
        path,
        commands[++iterator],
        commands[++iterator],
        commands[++iterator],
        commands[++iterator],
        commands[++iterator]
    );
    return iterator;
}

function glCutoutState (context, path, commands, iterator) {
    if (!context.WebGLRenderer) context.initWebGL();
    context.WebGLRenderer.setCutoutState(path, commands[++iterator]);
    return iterator;
}

function glMeshVisibility (context, path, commands, iterator) {
    if (!context.WebGLRenderer) context.initWebGL();
    context.WebGLRenderer.setMeshVisibility(path, commands[++iterator]);
    return iterator;
}

function glRemoveMesh (context, path, commands, iterator) {
    if (!context.WebGLRenderer) context.initWebGL();
    context.WebGLRenderer.removeMesh(path);
    return iterator;
}

function pinholeProjection (context, path, commands, iterator) {
    context._renderState.projectionType = Camera.PINHOLE_PROJECTION;
    context._renderState.perspectiveTransform[11] = -1 / commands[++iterator];
    context._renderState.perspectiveDirty = true;
    return iterator;
}

function orthographicProjection (context, path, commands, iterator) {
    context._renderState.projectionType = Camera.ORTHOGRAPHIC_PROJECTION;
    context._renderState.perspectiveTransform[11] = 0;
    context._renderState.perspectiveDirty = true;
    return iterator;
}

function changeViewTransform (context, path, commands, iterator) {
    context._renderState.viewTransform[0] = commands[++iterator];
    context._renderState.viewTransform[1] = commands[++iterator];
    context._renderState.viewTransform[2] = commands[++iterator];
    context._renderState.viewTransform[3] = commands[++iterator];

    context._renderState.viewTransform[4] = commands[++iterator];
    context._renderState.viewTransform[5] = commands[++iterator];
    context._renderState.viewTransform[6] = commands[++iterator];
    context._renderState.viewTransform[7] = commands[++iterator];

    context._renderState.viewTransform[8] = commands[++iterator];
    context._renderState.viewTransform[9] = commands[++iterator];
    context._renderState.viewTransform[10] = commands[++iterator];
    context._renderState.viewTransform[11] = commands[++iterator];

    context._renderState.viewTransform[12] = commands[++iterator];
    context._renderState.viewTransform[13] = commands[++iterator];
    context._renderState.viewTransform[14] = commands[++iterator];
    context._renderState.viewTransform[15] = commands[++iterator];

    context._renderState.viewDirty = true;
    return iterator;
}

module.exports = Context;

