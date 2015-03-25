var VirtualElement = require('famous-dom-renderers').VirtualElement;
var WebGLRenderer = require('famous-webgl-renderers').WebGLRenderer;

function Context(selector, compositor) {
	var DOMLayerEl = document.createElement('div');

	this._rootEl = document.querySelector(selector);
	this._rootEl.appendChild(DOMLayerEl);
	DOMLayerEl.style.width = '100%';
	DOMLayerEl.style.height = '100%';

	this._DOMRenderer = new VirtualElement(DOMLayerEl, selector, compositor);
	this._WebGLRenderer;

	this._children = {};
}

Context.CommandsToOutput = {
    CHANGE_TRANSFORM_ORIGIN: 'DOM-WEBGL',
    CHANGE_TRANSFORM: 'DOM-WEBGL',
    CHANGE_PROPERTY: 'DOM',
    CHANGE_CONTENT: 'DOM',
    CHANGE_SIZE: 'DOM-WEBGL',
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

Context.prototype.receive = function receive(pathArr, commands) {
    var pointer = this._children;
    var index = pathArr.shift();
    var parentEl = this._DOMRenderer;

    while (pathArr.length) {
        if (!pointer[index]) pointer[index] = {};
        pointer = pointer[index];
        if (pointer.DOM) parentEl = pointer.DOM;
        index = pathArr.shift();
    }
    if (!pointer[index]) pointer[index] = {};
    pointer = pointer[index];

	while (commands.length) {
        var commandOutput = Context.CommandsToOutput[commands[0]];
        switch (commandOutput) {
            case 'DOM':
                var element = parentEl.getOrSetElement(path, index, this._DOMRenderer);
                element.receive(commands);
                if (!pointer.DOM) {
                    pointer.DOM = element;
                    // this._renderers.push(element);
                }
                break;

            case 'GL':
                if (!this._WebGLRenderer) {
                    var webglrenderer = new WebGLRenderer(this._DOMRenderer);
                    this._WebGLRenderer = webglrenderer;
                    // this._renderers.push(webglrenderer);
                }
                this._WebGLRenderer.receive(index, commands);
                break;

            case 'DOM-WEBGL':
                var commandCopy = commands.slice();
                var element = parentEl.getOrSetElement(index, index, this._DOMRenderer);
                    element.receive(commands);
                if (!pointer.DOM) {
                    pointer.DOM = element;
                    // this._renderers.push(element);
                }
                if (!this._WebGLRenderer) {
                    var webglrenderer = new WebGLRenderer(this._DOMRenderer);
                    this._WebGLRenderer = webglrenderer;
                    // this._renderers.push(webglrenderer);
                }
                this._WebGLRenderer.receive(index, commandCopy);
                break;

            default: return;
        }
	}
};

module.exports = Context;