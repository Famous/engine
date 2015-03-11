var VirtualElement = require('famous-dom-renderers').VirtualElement;
var WebGLRenderer = require('famous-webgl-renderers').WebGLRenderer;
var Camera = require('famous-components').Camera;

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
}

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
    GL_CREATE_LIGHT: 'GL',
    GL_LIGHT_POSITION: 'GL',
    GL_LIGHT_COLOR: 'GL',
    GL_CREATE_MESH: 'GL',
    GL_SET_DRAW_OPTIONS: 'GL',
    MATERIAL_INPUT: 'GL'
};

Compositor.prototype.sendEvent = function sendEvent(path, ev, payload) {
    this._outCommands.push('WITH', path, 'TRIGGER', ev, payload);
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
    this.sendResize(selector, size);
    var _this = this;
    if (selector === 'body')
        window.addEventListener('resize', function() {
            if (!_this._sentResize) {
                _this.sendResize(selector, _this.getOrSetContext(selector).DOM._getSize());
            }
        });
    return this;
};

Compositor.prototype.sendResize = function sendResize (selector, size) {
    this._outCommands.push('WITH', selector, 'TRIGGER', 'resize', size[0], size[1]);
    this._sentResize = true;
    return this;
};

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
                this.proxy(commands);
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

Compositor.prototype.proxy = function proxy (commands) {
    var path = commands.shift();
    var type = commands.shift();

    var _this = this;
    window[path].addEventListener(type, function(ev) {
        // ev = JSON.stringify(ev);
        _this._outCommands.push('WITH', path, 'TRIGGER', type, ev);
    });
};

Compositor.prototype.receiveCommands = function receiveCommands(commands) {
    var len = commands.length;
    for (var i = 0; i < len; i++) {
        this._inCommands.push(commands[i]);
    }
};

Compositor.prototype.clearCommands = function clearCommands() {
    this._outCommands.length = 0;
    this._sentResize = false;
};

module.exports = Compositor;
