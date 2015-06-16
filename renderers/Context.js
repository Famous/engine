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
 */
function Context(selector, compositor) {
    this._compositor = compositor;
    this._rootEl = document.querySelector(selector);
    this._selector = selector;

    if (this._rootEl === null) {
        throw new Error(
            'Failed to create Context: ' +
            'No matches for "' + selector + '" found.'
        );
    }

    this._selector = selector;

    // Initializes the DOMRenderer.
    // Every Context has at least a DOMRenderer for now.
    this._initDOMRenderer();

    // WebGLRenderer will be instantiated when needed.
    this._webGLRenderer = null;
    this._domRenderer = new DOMRenderer(this._domRendererRootEl, selector, compositor);
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

    this._meshTransform = new Float32Array(16);
    this._meshSize = [0, 0, 0];

    this._initDOM = false;

    this._commandCallbacks = [];
    this.initCommandCallbacks();

    this.updateSize();
}

/**
 * Queries DOMRenderer size and updates canvas size. Relays size information to
 * WebGLRenderer.
 *
 * @method
 *
 * @return {Context} this
 */
Context.prototype.updateSize = function () {
    var width = this._rootEl.offsetWidth;
    var height = this._rootEl.offsetHeight;

    this._size[0] = width;
    this._size[1] = height;
    this._size[2] = (width > height) ? width : height;

    this._compositor.sendResize(this._selector, this._size);
    if (this._webGLRenderer) this._webGLRenderer.updateSize(this._size);

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
    this._domRenderer.draw(this._renderState);
    if (this._webGLRenderer) this._webGLRenderer.draw(this._renderState);

    if (this._renderState.perspectiveDirty) this._renderState.perspectiveDirty = false;
    if (this._renderState.viewDirty) this._renderState.viewDirty = false;
};

/**
 * Initializes the DOMRenderer by creating a root DIV element and appending it
 * to the context.
 *
 * @method
 * @private
 *
 * @return {undefined} undefined
 */
Context.prototype._initDOMRenderer = function _initDOMRenderer() {
    this._domRendererRootEl = document.createElement('div');
    this._rootEl.appendChild(this._domRendererRootEl);
    this._domRendererRootEl.style.display = 'none';

    this._domRenderer = new DOMRenderer(
        this._domRendererRootEl,
        this._selector,
        this._compositor
    );
};

Context.prototype.getRootSize = function getRootSize() {
    return [
        this._rootEl.offsetWidth,
        this._rootEl.offsetHeight
    ];
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
    this._commandCallbacks[Commands.PREVENT_DEFAULT] = preventDefault;
    this._commandCallbacks[Commands.ALLOW_DEFAULT] = allowDefault;
    this._commandCallbacks[Commands.READY] = ready;
};

/**
 * Initializes the WebGLRenderer and updates it initial size.
 *
 * The Initialization process consists of the following steps:
 *
 * 1. A new `<canvas>` element is being created and appended to the root element.
 * 2. The WebGLRenderer is being instantiated.
 * 3. The size of the WebGLRenderer is being updated.
 *
 * @method
 * @private
 *
 * @return {undefined} undefined
 */
Context.prototype._initWebGLRenderer = function _initWebGLRenderer() {
    this._webGLRendererRootEl = document.createElement('canvas');
    this._rootEl.appendChild(this._webGLRendererRootEl);

    this._webGLRenderer = new WebGLRenderer(
        this._webGLRendererRootEl,
        this._compositor
    );

    // Don't read offset width and height.
    this._webGLRenderer.updateSize(this._size);
};

/**
 * Gets the size of the parent element of the DOMRenderer for this context.
 *
 * @method
 *
 * @return {undefined} undefined
 */
Context.prototype.getRootSize = function getRootSize() {
    return [
        this._rootEl.offsetWidth,
        this._rootEl.offsetHeight
    ];
};


/**
 * Initializes the context if the `READY` command has been received earlier.
 *
 * @return {undefined} undefined
 */
Context.prototype.checkInit = function checkInit () {
    if (this._initDOM) {
        this._domRendererRootEl.style.display = 'block';
        this._initDOM = false;
    }
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

    this._domRenderer.loadPath(path);
    this._domRenderer.findTarget();

    while (command != null) {
        if (command === Commands.WITH || command === Commands.TIME) return localIterator - 1;
        else localIterator = this._commandCallbacks[command](this, path, commands, localIterator) + 1; 
        command = commands[localIterator];
    }

    return localIterator;
};

/**
 * Getter method used for retrieving the used DOMRenderer.
 *
 * @method
 *
 * @return {DOMRenderer}    The DOMRenderer being used by the Context.
 */
Context.prototype.getDOMRenderer = function getDOMRenderer() {
    return this._domRenderer;
};

/**
 * Getter method used for retrieving the used WebGLRenderer (if any).
 *
 * @method
 *
 * @return {WebGLRenderer|null}    The WebGLRenderer being used by the Context.
 */
Context.prototype.getWebGLRenderer = function getWebGLRenderer() {
    return this._webGLRenderer;
};

// Command Callbacks
function preventDefault (context, path, commands, iterator) {
    if (context._webGLRenderer) context._webGLRenderer.getOrSetCutout(path);
    context._domRenderer.preventDefault(commands[++iterator]);
    return iterator;
}

function allowDefault (context, path, commands, iterator) {
    if (context._webGLRenderer) context._webGLRenderer.getOrSetCutout(path);
    context._domRenderer.allowDefault(commands[++iterator]);
    return iterator;
}

function ready (context, path, commands, iterator) {
    context._initDOM = true;
    return iterator;
}

function initDOM (context, path, commands, iterator) {
    context._domRenderer.insertEl(commands[++iterator]);
    return iterator;
}

function domRenderSize (context, path, commands, iterator) {
    context._domRenderer.getSizeOf(commands[++iterator]);
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

    context._domRenderer.setMatrix(temp);
    
    if (context._webGLRenderer)
        context._webGLRenderer.setCutoutUniform(path, 'u_transform', temp);

    return iterator;
}

function changeSize (context, path, commands, iterator) {
    var width = commands[++iterator];
    var height = commands[++iterator];

    context._domRenderer.setSize(width, height);
    if (context._webGLRenderer) {
        context._meshSize[0] = width;
        context._meshSize[1] = height;
        context._webGLRenderer.setCutoutUniform(path, 'u_size', context._meshSize);
    }
    
    return iterator;
}

function changeProperty (context, path, commands, iterator) {
    if (context._webGLRenderer) context._webGLRenderer.getOrSetCutout(path);
    context._domRenderer.setProperty(commands[++iterator], commands[++iterator]);
    return iterator;
}

function changeContent (context, path, commands, iterator) {
    if (context._webGLRenderer) context._webGLRenderer.getOrSetCutout(path);
    context._domRenderer.setContent(commands[++iterator]);
    return iterator;
}
  
function changeAttribute (context, path, commands, iterator) {
    if (context._webGLRenderer) context._webGLRenderer.getOrSetCutout(path);
    context._domRenderer.setAttribute(commands[++iterator], commands[++iterator]);
    return iterator;
}

function addClass (context, path, commands, iterator) {
    if (context._webGLRenderer) context._webGLRenderer.getOrSetCutout(path);
    context._domRenderer.addClass(commands[++iterator]);
    return iterator;
}

function removeClass (context, path, commands, iterator) {
    if (context._webGLRenderer) context._webGLRenderer.getOrSetCutout(path);
    context._domRenderer.removeClass(commands[++iterator]);
    return iterator;
}

function subscribe (context, path, commands, iterator) {
    if (context._webGLRenderer) context._webGLRenderer.getOrSetCutout(path);
    context._domRenderer.subscribe(commands[++iterator]);
    return iterator;
}

function glSetDrawOptions (context, path, commands, iterator) {
    if (!context._webGLRenderer) context._initWebGLRenderer();
    context._webGLRenderer.setMeshOptions(path, commands[++iterator]);
    return iterator;
}

function glAmbientLight (context, path, commands, iterator) {
    if (!context._webGLRenderer) context._initWebGLRenderer();
    context._webGLRenderer.setAmbientLightColor(
        path,
        commands[++iterator],
        commands[++iterator],
        commands[++iterator]
    );
    return iterator;
}

function glLightPosition (context, path, commands, iterator) {
    if (!context._webGLRenderer) context._initWebGLRenderer();
    context._webGLRenderer.setLightPosition(
        path,
        commands[++iterator],
        commands[++iterator],
        commands[++iterator]
    );
    return iterator;
}

function glLightColor (context, path, commands, iterator) {
    if (!context._webGLRenderer) context._initWebGLRenderer();
    context._webGLRenderer.setLightColor(
        path,
        commands[++iterator],
        commands[++iterator],
        commands[++iterator]
    );
    return iterator;
}

function materialInput (context, path, commands, iterator) {
    if (!context._webGLRenderer) context._initWebGLRenderer();
    context._webGLRenderer.handleMaterialInput(
        path,
        commands[++iterator],
        commands[++iterator]
    );
    return iterator;
}

function glSetGeometry (context, path, commands, iterator) {
    if (!context._webGLRenderer) context._initWebGLRenderer();
    context._webGLRenderer.setGeometry(
        path,
        commands[++iterator],
        commands[++iterator],
        commands[++iterator]
    );
    return iterator;
}

function glUniforms (context, path, commands, iterator) {
    if (!context._webGLRenderer) context._initWebGLRenderer();
    context._webGLRenderer.setMeshUniform(
        path,
        commands[++iterator],
        commands[++iterator]
    );
    return iterator;
}

function glBufferData (context, path, commands, iterator) {
    if (!context._webGLRenderer) context._initWebGLRenderer();
    context._webGLRenderer.bufferData(
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
    if (!context._webGLRenderer) context._initWebGLRenderer();
    context._webGLRenderer.setCutoutState(path, commands[++iterator]);
    return iterator;
}

function glMeshVisibility (context, path, commands, iterator) {
    if (!context._webGLRenderer) context._initWebGLRenderer();
    context._webGLRenderer.setMeshVisibility(path, commands[++iterator]);
    return iterator;
}

function glRemoveMesh (context, path, commands, iterator) {
    if (!context._webGLRenderer) context._initWebGLRenderer();
    context._webGLRenderer.removeMesh(path);
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
