var VirtualElement = require('famous-dom-renderers').VirtualElement;
var WebGLRenderer = require('famous-webgl-renderers').WebGLRenderer;

var DOM = 'DOM';
var GL = 'GL';
var WITH = 'WITH';
var TRIGGER = 'TRIGGER';
var RESIZE = 'resize';
var NEED_SIZE_FOR = 'NEED_SIZE_FOR';

function Compositor() {
    this._contexts = {};
    this._outCommands = [];
    this._inCommands = [];

    this._renderers = [];
}

Compositor.CommandsToOutput = {
    CHANGE_TRANSFORM_ORIGIN: DOM,
    CHANGE_TRANSFORM: DOM,
    CHANGE_PROPERTY: DOM,
    CHANGE_CONTENT: DOM,
    ADD_EVENT_LISTENER: DOM,
    RECALL: DOM,
    GL_UNIFORMS: GL,
    GL_BUFFER_DATA: GL,
    GL_SET_GEOMETRY: GL,
    GL_CREATE_LIGHT: GL,
    GL_LIGHT_POSITION: GL,
    GL_LIGHT_COLOR: GL
};

Compositor.prototype.sendEvent = function sendEvent(path, ev, payload) {
    this._outCommands.push(WITH, path, TRIGGER, ev, payload);
};


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
    var commandOutput = Compositor.CommandsToOutput[commands[0]];

    switch (commandOutput) {
        case DOM:
            var element = parent.getOrSetElement(path, index);
            element.receive(commands);
            pointer.DOM = element;
            break;

        case GL:
            if (!context.GL) {
                var webglrenderer = new WebGLRenderer(context.DOM);
                context.GL = webglrenderer;
                this._renderers.push(webglrenderer);
            }
            context.GL.receive(path, commands);
            break;
    }
};

Compositor.prototype.getOrSetContext = function getOrSetContext(selector) {
    if (this._contexts[selector]) return this._contexts[selector];
    var result = {
        DOM: new VirtualElement(document.querySelector(selector), selector, this)
    };
    result.DOM.setMatrix(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    this._contexts[selector] = result;
    return result;
};

Compositor.prototype.giveSizeFor = function giveSizeFor(commands) {
    var selector = commands.shift();
    var size = this.getOrSetContext(selector).DOM._getSize();
    var report = {
        size: size
    };
    this._outCommands.push(WITH, selector, TRIGGER, RESIZE, report);
};

Compositor.prototype.drawCommands = function drawCommands() {
    var commands = this._inCommands;
    var command;

    while (commands.length) {
        command = commands.shift();
        switch (command) {
            case WITH:
                this.handleWith(commands);
                break;
            case NEED_SIZE_FOR:
                this.giveSizeFor(commands);
                break;
        }
    }

    for (var i = 0; i < this._renderers.length; i++) {
        this._renderers[i].draw();
    }

    return this._outCommands;
};

Compositor.prototype.receiveCommands = function receiveCommands(commands) {
    var len = commands.length;
    for (var i = 0; i < len; i++) {
        this._inCommands.push(commands[i]);
    }
};

Compositor.prototype.clearCommands = function clearCommands() {
    this._outCommands.length = 0;
};

module.exports = Compositor;
