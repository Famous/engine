var VirtualElement = require('famous-dom-renderers').VirtualElement;
var WebGLRenderer = require('famous-webgl-renderers').WebGLRenderer;
var Camera = require('famous-components').Camera;

function Context(selector, compositor) {
	var DOMLayerEl = document.createElement('div');

	this._rootEl = document.querySelector(selector);
	this._rootEl.appendChild(DOMLayerEl);
	// DOMLayerEl.style.width = '100%';
	// DOMLayerEl.style.height = '100%';

	this._DOMRenderer = new VirtualElement(DOMLayerEl, selector, compositor);
	this._DOMRenderer.setMatrix(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

	this._WebGLRenderer;

	this._renderState = {
        projectionType: Camera.ORTHOGRAPHIC_PROJECTION,
        perspectiveTransform: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
        viewTransform: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
    };

	this._size = [];
	this._renderers = [];
	this._children = {};
}

Context.CommandsToOutput = {
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
    INIT_DOM:'DOM',
    RECALL: 'DOM',
    GL_UNIFORMS: 'GL',
    GL_BUFFER_DATA: 'GL',
    GL_SET_GEOMETRY: 'GL',
    GL_AMBIENT_LIGHT: 'GL',
    GL_LIGHT_POSITION: 'GL',
    GL_LIGHT_COLOR: 'GL',
    GL_SET_DRAW_OPTIONS: 'GL',
    MATERIAL_INPUT: 'GL',
    PINHOLE_PROJECTION: 'CAMERA',
	ORTHOGRAPHIC_PROJECTION: 'CAMERA',
	CHANGE_VIEW_TRANSFORM: 'CAMERA'
};

Context.prototype.draw = function draw() {
	for (var i = 0; i < this._renderers.length; i++) {
		this._renderers[i].draw(this._renderState);
	}
};

Context.prototype.getRootSize = function getRootSize() {
	this._size[0] = this._rootEl.offsetWidth;
	this._size[1] = this._rootEl.offsetHeight;

	return this._size;
}

Context.prototype.receive = function receive(pathArr, path, commands) {
    var pointer = this._children;
    var index = pathArr.shift();
    var parentEl = this._DOMRenderer;

    while (pathArr.length) {
    	pointer = pointer[index] = pointer[index] || {};
        if (pointer.DOM) parentEl = pointer.DOM;
        index = pathArr.shift();
    }
    pointer = pointer[index] = pointer[index] || {};

	while (commands.length) {
        var commandOutput = Context.CommandsToOutput[commands[0]];
        switch (commandOutput) {
            case 'DOM':
                var element = parentEl.getOrSetElement(path, index, commands);
                element.receive(commands);
                if (!pointer.DOM) {
                    pointer.DOM = element;
                    this._renderers.push(element);
                }
                break;

            case 'GL':
                if (!this._WebGLRenderer) {
                    var webglrenderer = new WebGLRenderer(this._rootEl);
                    this._WebGLRenderer = webglrenderer;
                    this._renderers.push(webglrenderer);
                }
                this._WebGLRenderer.receive(index, commands);
                break;

            case 'CAMERA':
            	var command = commands.shift();
            	switch (command) {

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


            default: return;
        }
	}
};

module.exports = Context;