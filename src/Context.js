var VirtualElement = require('famous-dom-renderers').VirtualElement;
var WebGLRenderer = require('famous-webgl-renderers').WebGLRenderer;
var Camera = require('famous-components').Camera;

function Context(selector, compositor) {
	var DOMLayerEl = document.createElement('div');

	this._rootEl = document.querySelector(selector);
	this._rootEl.appendChild(DOMLayerEl);

	this.DOMRenderer = new VirtualElement(DOMLayerEl, selector, compositor);
	this.DOMRenderer.setMatrix(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

	this.WebGLRenderer;

	this._renderState = {
        projectionType: Camera.ORTHOGRAPHIC_PROJECTION,
        perspectiveTransform: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
        viewTransform: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
    };

	this._size = [];
	this._renderers = [];
	this._children = {};
}

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
    var renderTag = commands.shift();
    var parentEl = this.DOMRenderer;

    var element;

    switch (renderTag) {
    	case 'DOM': 
		    while (pathArr.length) {
		    	pointer = pointer[index] = pointer[index] || {};
		        if (pointer.DOM) parentEl = pointer.DOM;
		        index = pathArr.shift();
		    }
		    pointer = pointer[index] = pointer[index] || {};
	        element = parentEl.getOrSetElement(path, index, commands);
            if (!pointer.DOM) this._renderers.push((pointer.DOM = element));
            break;

        case 'WEBGL':
            if (!this.WebGLRenderer) {
                this._renderers.push(
                	(this.WebGLRenderer = new WebGLRenderer(this._rootEl))
                );
            }

        default: break;
    }

	while (commands.length) {
        var command = commands.shift();

	    switch (command) {
			case 'CHANGE_TRANSFORM':
	            element.setMatrix(
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

	        case 'CHANGE_SIZE':
	            var width = commands.shift();
	            var height = commands.shift();
	            element._size[0] = width;
	            element._size[1] = height;
	            if (width !== true) {
	                element.setProperty('width', width + 'px');
	            } else {
	                element.setProperty('width', '');
	            }
	            if (height !== true) {
	                element.setProperty('height', height + 'px');
	            } else {
	                element.setProperty('height', '');
	            }
	            break;

	        case 'CHANGE_PROPERTY':
	            element.setProperty(commands.shift(), commands.shift());
	            break;

	        case 'CHANGE_CONTENT':
	            element.setContent(commands.shift());
	            break;

	        case 'CHANGE_ATTRIBUTE':
	            element.setAttribute(commands.shift(), commands.shift());
	            break;

	        case 'ADD_CLASS':
	            element.addClass(commands.shift());
	            break;

	        case 'REMOVE_CLASS':
	            element.removeClass(commands.shift());
	            break;

	        case 'ADD_EVENT_LISTENER':
	            var ev = commands.shift();
	            var methods;
	            var properties;
	            var c;
	            while ((c = commands.shift()) !== EVENT_PROPERTIES) methods = c;
	            while ((c = commands.shift()) !== EVENT_END) properties = c;
	            methods = methods || [];
	            properties = properties || [];
	            element.addEventListener(ev, element.dispatchEvent.bind(element, ev, methods, properties));
	            break;

	        case 'RECALL':
	            element.setProperty('display', 'none');
	            element._parent._allocator.deallocate(element._target);
	            break;

	        case 'GL_SET_DRAW_OPTIONS': 
	        	this.WebGLRenderer.setMeshOptions(path, commands.shift());
	            break;

	        case 'GL_AMBIENT_LIGHT':
	            this.WebGLRenderer.setAmbientLightColor(
	            	path,
	            	commands.shift(),
	            	commands.shift(),
	            	commands.shift()
	            );
	            break;

	        case 'GL_LIGHT_POSITION':
	            this.WebGLRenderer.setLightPosition(
	            	path,
	            	commands.shift(),
	            	commands.shift(),
	            	commands.shift()
	            );
	            break;

	        case 'GL_LIGHT_COLOR':
	            this.WebGLRenderer.setLightColor(
	            	path,
	            	commands.shift(),
	            	commands.shift(),
	            	commands.shift()
	            );
	            break;

	        case 'MATERIAL_INPUT':
	            this.WebGLRenderer.handleMaterialInput(
	            	path,
	            	commands.shift(),
	            	commands.shift()
	            );
	            break;

	        case 'GL_SET_GEOMETRY':
	            this.WebGLRenderer.setGeometry(
	            	path,
	            	commands.shift(),
	            	commands.shift(),
	            	commands.shift()
	            );
	            break;

	        case 'GL_UNIFORMS':

	            this.WebGLRenderer.setMeshUniform(
	            	path,
	            	commands.shift(),
	            	commands.shift()
	            );
	            break;

	        case 'GL_BUFFER_DATA':
	            this.WebGLRenderer.bufferData(
	            	path,
	            	commands.shift(),
	            	commands.shift(),
	            	commands.shift(),
	            	commands.shift()
	            );
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

	        case 'WITH': return commands.unshift(command); break;
	    }
	}
};

module.exports = Context;