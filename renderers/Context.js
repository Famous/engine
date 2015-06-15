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
function Context(selector, compositor, options) {
    this.options = options || {};

    this._compositor = compositor;
    this._rootEl = document.querySelector(selector);

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

    // WebGLRenderer will be instantiated if needed.
    if (this.options.disableWebGL !== true) {
        console.log(1)
        this._initWebGLRenderer();
    }

    // State holders

    this._renderState = {
        projectionType: Camera.ORTHOGRAPHIC_PROJECTION,
        perspectiveTransform: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
        viewTransform: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
        viewDirty: false,
        perspectiveDirty: false
    };

    this._size = [];

    this._meshTransform = [];
    this._meshSize = [0, 0, 0];

    this._initDOM = false;

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
    while (command) {
        switch (command) {
            case 'INIT_DOM':
                this._domRenderer.insertEl(commands[++localIterator]);
                break;

            case 'DOM_RENDER_SIZE':
                this._domRenderer.getSizeOf(commands[++localIterator]);
                break;

            case 'CHANGE_TRANSFORM':
                for (var i = 0 ; i < 16 ; i++) this._meshTransform[i] = commands[++localIterator];

                this._domRenderer.setMatrix(this._meshTransform);

                if (this._webGLRenderer)
                    this._webGLRenderer.setCutoutUniform(path, 'u_transform', this._meshTransform);
                break;

            case 'CHANGE_SIZE':
                var width = commands[++localIterator];
                var height = commands[++localIterator];

                this._domRenderer.setSize(width, height);
                if (this._webGLRenderer) {
                    this._meshSize[0] = width;
                    this._meshSize[1] = height;
                    this._webGLRenderer.setCutoutUniform(path, 'u_size', this._meshSize);
                }
                break;

            case 'CHANGE_PROPERTY':
                if (this._webGLRenderer) this._webGLRenderer.getOrSetCutout(path);
                this._domRenderer.setProperty(commands[++localIterator], commands[++localIterator]);
                break;

            case 'CHANGE_CONTENT':
                if (this._webGLRenderer) this._webGLRenderer.getOrSetCutout(path);
                this._domRenderer.setContent(commands[++localIterator]);
                break;

            case 'CHANGE_ATTRIBUTE':
                if (this._webGLRenderer) this._webGLRenderer.getOrSetCutout(path);
                this._domRenderer.setAttribute(commands[++localIterator], commands[++localIterator]);
                break;

            case 'ADD_CLASS':
                if (this._webGLRenderer) this._webGLRenderer.getOrSetCutout(path);
                this._domRenderer.addClass(commands[++localIterator]);
                break;

            case 'REMOVE_CLASS':
                if (this._webGLRenderer) this._webGLRenderer.getOrSetCutout(path);
                this._domRenderer.removeClass(commands[++localIterator]);
                break;

            case 'SUBSCRIBE':
            if (this._webGLRenderer) this._webGLRenderer.getOrSetCutout(path);
                this._domRenderer.subscribe(commands[++localIterator]);
                break;

            case 'UNSUBSCRIBE':
            if (this._webGLRenderer) this._webGLRenderer.getOrSetCutout(path);
                this._domRenderer.unsubscribe(commands[++localIterator]);
                break;

            case 'PREVENT_DEFAULT':
            if (this._webGLRenderer) this._webGLRenderer.getOrSetCutout(path);
                this._domRenderer.preventDefault(commands[++localIterator]);
                break;

            case 'ALLOW_DEFAULT':
            if (this._webGLRenderer) this._webGLRenderer.getOrSetCutout(path);
                this._domRenderer.allowDefault(commands[++localIterator]);
                break;

            case 'UNSUBSCRIBE':
                if (this._webGLRenderer) this._webGLRenderer.getOrSetCutout(path);
                this._domRenderer.unsubscribe(commands[++localIterator]);
                break;

            case 'GL_SET_DRAW_OPTIONS':
                if (this._webGLRenderer)
                    this._webGLRenderer.setMeshOptions(
                        path,
                        commands[++localIterator]
                    );
                break;

            case 'GL_AMBIENT_LIGHT':
                if (this._webGLRenderer)
                    this._webGLRenderer.setAmbientLightColor(
                        path,
                        commands[++localIterator],
                        commands[++localIterator],
                        commands[++localIterator]
                    );
                break;

            case 'GL_LIGHT_POSITION':
                if (this._webGLRenderer) 
                    this._webGLRenderer.setLightPosition(
                        path,
                        commands[++localIterator],
                        commands[++localIterator],
                        commands[++localIterator]
                    );
                break;

            case 'GL_LIGHT_COLOR':
                if (this._webGLRenderer)
                    this._webGLRenderer.setLightColor(
                        path,
                        commands[++localIterator],
                        commands[++localIterator],
                        commands[++localIterator]
                    );
                break;

            case 'MATERIAL_INPUT':
                if (this._webGLRenderer)
                    this._webGLRenderer.handleMaterialInput(
                        path,
                        commands[++localIterator],
                        commands[++localIterator]
                    );
                break;

            case 'GL_SET_GEOMETRY':
                if (this._webGLRenderer)
                    this._webGLRenderer.setGeometry(
                        path,
                        commands[++localIterator],
                        commands[++localIterator],
                        commands[++localIterator]
                    );
                break;

            case 'GL_UNIFORMS':
                if (this._webGLRenderer)
                    this._webGLRenderer.setMeshUniform(
                        path,
                        commands[++localIterator],
                        commands[++localIterator]
                    );
                break;

            case 'GL_BUFFER_DATA':
                if (this._webGLRenderer)
                    this._webGLRenderer.bufferData(
                        path,
                        commands[++localIterator],
                        commands[++localIterator],
                        commands[++localIterator],
                        commands[++localIterator],
                        commands[++localIterator]
                    );
                break;

            case 'GL_CUTOUT_STATE':
                if (this._webGLRenderer)
                    this._webGLRenderer.setCutoutState(path, commands[++localIterator]);
                break;

            case 'GL_MESH_VISIBILITY':
                if (this._webGLRenderer)
                    this._webGLRenderer.setMeshVisibility(path, commands[++localIterator]);
                break;

            case 'GL_REMOVE_MESH':
                if (this._webGLRenderer)
                    this._webGLRenderer.removeMesh(path);
                break;

            case 'PINHOLE_PROJECTION':
                this._renderState.projectionType = Camera.PINHOLE_PROJECTION;
                this._renderState.perspectiveTransform[11] = -1 / commands[++localIterator];

                this._renderState.perspectiveDirty = true;
                break;

            case 'ORTHOGRAPHIC_PROJECTION':
                this._renderState.projectionType = Camera.ORTHOGRAPHIC_PROJECTION;
                this._renderState.perspectiveTransform[11] = 0;

                this._renderState.perspectiveDirty = true;
                break;

            case 'CHANGE_VIEW_TRANSFORM':
                this._renderState.viewTransform[0] = commands[++localIterator];
                this._renderState.viewTransform[1] = commands[++localIterator];
                this._renderState.viewTransform[2] = commands[++localIterator];
                this._renderState.viewTransform[3] = commands[++localIterator];

                this._renderState.viewTransform[4] = commands[++localIterator];
                this._renderState.viewTransform[5] = commands[++localIterator];
                this._renderState.viewTransform[6] = commands[++localIterator];
                this._renderState.viewTransform[7] = commands[++localIterator];

                this._renderState.viewTransform[8] = commands[++localIterator];
                this._renderState.viewTransform[9] = commands[++localIterator];
                this._renderState.viewTransform[10] = commands[++localIterator];
                this._renderState.viewTransform[11] = commands[++localIterator];

                this._renderState.viewTransform[12] = commands[++localIterator];
                this._renderState.viewTransform[13] = commands[++localIterator];
                this._renderState.viewTransform[14] = commands[++localIterator];
                this._renderState.viewTransform[15] = commands[++localIterator];

                this._renderState.viewDirty = true;
                break;

            case 'READY':
                this._initDOM = true;
                break;

            case 'WITH':
                return localIterator - 1;
        }

        command = commands[++localIterator];
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


module.exports = Context;
