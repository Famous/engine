'use strict';

var VirtualElement = require('famous-dom-renderers').VirtualElement;
var WebGLRenderer = require('famous-webgl-renderers').WebGLRenderer;
var Camera = require('famous-components').Camera;
var VirtualWindow = require('./VirtualWindow');

/**
 * Instantiates a new Compositor, used for routing commands received from the
 * WebWorker to the WebGL and DOM renderer.
 * 
 * @class Compositor
 * @constructor
 */
function Compositor() {
    this._contexts = {};
    this._outCommands = [];
    this._inCommands = [];

    this._renderers = [];
    this._renderState = {
        projectionType: Camera.ORTHOGRAPHIC_PROJECTION,
        perspectiveTransform: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
        viewTransform: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
    };

    this._virtualWindow = new VirtualWindow(this);
}

/**
 * Exposes a key-value-mapping of commands to the renderer they should be
 * routed to.
 * 
 * @type {Object}
 */
Compositor.CommandsToOutput = {
    CHANGE_TRANSFORM_ORIGIN: 'DOM',
    CHANGE_TRANSFORM: 'DOM',
    CHANGE_PROPERTY: 'DOM',
    CHANGE_CONTENT: 'DOM',
    CHANGE_SIZE: 'DOM',
    ADD_EVENT_LISTENER: 'DOM',
    ADD_CLASS:'DOM',
    REMOVE_CLASS:'DOM',
    EVENT_PROPERTIES:'DOM',
    EVENT_END:'DOM',
    CHANGE_ATTRIBUTE:'DOM',
    CHANGE_TAG:'DOM',
    RECALL: 'DOM',
    GL_UNIFORMS: 'GL',
    GL_BUFFER_DATA: 'GL',
    GL_SET_GEOMETRY: 'GL',
    GL_AMBIENT_LIGHT: 'GL',
    GL_LIGHT_POSITION: 'GL',
    GL_LIGHT_COLOR: 'GL',
    GL_SET_DRAW_OPTIONS: 'GL',
    MATERIAL_INPUT: 'GL'
};

/**
 * Schedules an event to be sent to the WebWorker the next time the out command
 * queue is being flushed.
 *
 * @method sendEvent
 * @private
 * 
 * @param  {String} path    render path to the node the event should be
 *                          triggered on (*targeted event*)
 * @param  {String} ev      event type
 * @param  {Object} payload event object (serializable using structured
 *                          cloning algorithm)
 */
Compositor.prototype.sendEvent = function sendEvent(path, ev, payload) {
    this._outCommands.push('WITH', path, 'TRIGGER', ev, payload);
};

/**
 * Internal helper method used by `drawCommands`.
 * 
 * @method handleWith
 * @private
 * 
 * @param  {Array} commands     remaining message queue received from the
 *                              WebWorker, used to shift single messages from
 */
Compositor.prototype.handleWith = function handleWith (commands) {
    var path = commands.shift();
    var pathArr = path.split('/');
    var context = this.getOrSetContext(pathArr.shift());
    var pointer = context;
    var index = pathArr.shift();
    var parent = context.DOM;
    while (pathArr.length) {
        if (!pointer[index]) pointer[index] = {};
        pointer = pointer[index];
        if (pointer.DOM) parent = pointer.DOM;
        index = pathArr.shift();
    }
    if (!pointer[index]) pointer[index] = {};
    pointer = pointer[index];
    while (commands.length) {
        var commandOutput = Compositor.CommandsToOutput[commands[0]];
        switch (commandOutput) {
            case 'DOM':
                var element = parent.getOrSetElement(path, index, context.DOM);
                element.receive(commands);
                if (!pointer.DOM) {
                    pointer.DOM = element;
                    this._renderers.push(element);
                }
                break;

            case 'GL':
                if (!context.GL) {
                    var webglrenderer = new WebGLRenderer(context.DOM);
                    context.GL = webglrenderer;
                    this._renderers.push(webglrenderer);
                }
                context.GL.receive(path, commands);
                break;
            default: return;
        }
    }
};

/**
 * Retrieves the top-level VirtualElement attached to the passed in document
 * selector.
 * If no such element exists, one will be instantiated, therefore representing
 * the equivalent of a Context in the Main Thread.
 *
 * @method getOrSetContext
 * @private
 * 
 * @param  {String} selector            document query selector used for
 *                                      retrieving the DOM node the
 *                                      VirtualElement should be attached to
 * @return {Object} result              
 * @return {VirtualElement} result.DOM  final VirtualElement
 */
Compositor.prototype.getOrSetContext = function getOrSetContext(selector) {
    if (this._contexts[selector]) return this._contexts[selector];
    var result = {
        DOM: new VirtualElement(document.querySelector(selector), selector, this, undefined, undefined, true)
    };
    result.DOM.setMatrix(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    this._contexts[selector] = result;
    return result;
};

/**
 * Internal helper method used by `drawCommands`.
 *
 * @method giveSizeFor
 * @private
 * 
 * @param  {Array} commands     remaining message queue received from the
 *                              WebWorker, used to shift single messages from
 */
Compositor.prototype.giveSizeFor = function giveSizeFor(commands) {
    var selector = commands.shift();
    var size = this.getOrSetContext(selector).DOM._getSize();
    this.sendResize(selector, size);
    var _this = this;
    if (selector === 'body')
        window.addEventListener('resize', function() {
            if (!_this._sentResize) {
                _this.sendResize(selector, _this.getOrSetContext(selector).DOM._getSize());
            }
        });
};

/**
 * Internal helper method used for notifying the WebWorker about externally
 * resized contexts (e.g. by resizing the browser window).
 *
 * @method sendResize
 * @private
 *
 * @param  {String} selector    render path to the node (context) that should
 *                              be resized
 * @param  {Array} size         new context size
 */
Compositor.prototype.sendResize = function sendResize (selector, size) {
    this._outCommands.push('WITH', selector, 'TRIGGER', 'resize', size);
    this._sentResize = true;
};

/**
 * Processes the previously via `receiveCommands` updated incoming "in"
 * command queue.
 * Called by ThreadManager.
 *
 * @method drawCommands
 *
 * @return {Array} outCommands  set of commands to be sent back to the
 *                              WebWorker
 */
Compositor.prototype.drawCommands = function drawCommands() {
    var commands = this._inCommands;
    var command;
    while (commands.length) {
        command = commands.shift();
        switch (command) {
            case 'WITH':
                this.handleWith(commands);
                break;
            case 'PROXY':
                this._virtualWindow.listen(commands.shift(), commands.shift());
                break;
            case 'NEED_SIZE_FOR':
                this.giveSizeFor(commands);
                break;
            case 'PINHOLE_PROJECTION':
                this._renderState.projectionType = Camera.PINHOLE_PROJECTION;
                this._renderState.perspectiveTransform[11] = -1/commands.shift();
                break;
            case 'ORTHOGRAPHIC_PROJECTION':
                this._renderState.projectionType = Camera.ORTHOGRAPHIC_PROJECTION;
                this._renderState.perspectiveTransform[11] = 0;
                break;
            case 'CHANGE_VIEW_TRANSFORM':
                this._renderState.viewTransform[0] = commands.shift();
                this._renderState.viewTransform[1] = commands.shift();
                this._renderState.viewTransform[2] = commands.shift();
                this._renderState.viewTransform[3] = commands.shift();

                this._renderState.viewTransform[4] = commands.shift();
                this._renderState.viewTransform[5] = commands.shift();
                this._renderState.viewTransform[6] = commands.shift();
                this._renderState.viewTransform[7] = commands.shift();

                this._renderState.viewTransform[8] = commands.shift();
                this._renderState.viewTransform[9] = commands.shift();
                this._renderState.viewTransform[10] = commands.shift();
                this._renderState.viewTransform[11] = commands.shift();

                this._renderState.viewTransform[12] = commands.shift();
                this._renderState.viewTransform[13] = commands.shift();
                this._renderState.viewTransform[14] = commands.shift();
                this._renderState.viewTransform[15] = commands.shift();
                break;
        }
    }

    for (var i = 0; i < this._renderers.length; i++) {
        this._renderers[i].draw(this._renderState);
    }

    return this._outCommands;
};

/**
 * Used by ThreadManager to update the interal queue of incoming commands.
 * Receiving commands does not immediately start the rederning process.
 * 
 * @param  {Array} commands     command queue to be processed by the
 *                              compositor's `drawCommands` method
 */
Compositor.prototype.receiveCommands = function receiveCommands(commands) {
    var len = commands.length;
    for (var i = 0; i < len; i++) {
        this._inCommands.push(commands[i]);
    }
};

/**
 * Flushes the queue of outgoing "out" commands.
 * Called by ThreadManager.
 *
 * @method clearCommands
 */
Compositor.prototype.clearCommands = function clearCommands() {
    this._outCommands.length = 0;
    this._sentResize = false;
};

module.exports = Compositor;
