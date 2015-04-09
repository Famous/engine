var VirtualElement = require('famous-dom-renderers').VirtualElement;
var WebGLRenderer = require('famous-webgl-renderers').WebGLRenderer;
var Camera = require('famous-components').Camera;

function Context(selector, compositor) {
    this._rootEl = document.querySelector(selector);
    if (this._rootEl === document.body) {
        window.addEventListener('resize', this.updateSize.bind(this));
    }

    var DOMLayerEl = document.createElement('div');
    DOMLayerEl.style.width = '100%';
    DOMLayerEl.style.height = '100%';
    this._rootEl.appendChild(DOMLayerEl);
    this.DOMRenderer = new VirtualElement(DOMLayerEl, selector, compositor, undefined, undefined, true);
    this.DOMRenderer.setMatrix(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    
    this.WebGLRenderer;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'famous-webgl';
    this._rootEl.appendChild(this.canvas);

    this._renderState = {
        projectionType: Camera.ORTHOGRAPHIC_PROJECTION,
        perspectiveTransform: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
        viewTransform: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
    };

    this._size = [];
    this._renderers = [];
    this._children = {};
    this._elementHash = {};

    this._meshTransform = [];
    this._meshSize = [0, 0, 0];

    this.updateSize();
}

Context.prototype.updateSize = function () {
    var newSize = this.DOMRenderer._getSize();

    var width = newSize[0];
    var height = newSize[1];

    this._size[0] = width;
    this._size[1] = height;
    this._size[2] = (width > height) ? width : height;

    this.canvas.width  = width;
    this.canvas.height = height;

    if (this.WebGLRenderer) this.WebGLRenderer.updateSize(this._size);

    return this;
}

Context.prototype.draw = function draw() {
    for (var i = 0; i < this._renderers.length; i++) {
        this._renderers[i].draw(this._renderState);
    }
};

Context.prototype.getRootSize = function getRootSize() {
    return this._size;
};

Context.prototype.initWebGL = function initWebGL() {
    this._renderers.push((this.WebGLRenderer = new WebGLRenderer(this.canvas)));
    this.WebGLRenderer.updateSize(this._size);
};

Context.prototype.receive = function receive(pathArr, path, commands) {
    var pointer;
    var parentEl;
    var element;
    var id;

    var command = commands[commands.index++];

    while (command) {
        switch (command) {
            case 'INIT_DOM':
                id = pathArr.shift();
                pointer = this._children;
                parentEl = this.DOMRenderer;

                while (pathArr.length) {
                    pointer = pointer[id] = pointer[id] || {};
                    if (pointer.DOM) parentEl = pointer.DOM;
                    id = pathArr.shift();
                }
                pointer = pointer[id] = pointer[id] || {};
                element = parentEl.addChild(path, id, commands[commands.index++]);
                this._elementHash[path] = element;
                this._renderers.push((pointer.DOM = element));
                break;

            case 'CHANGE_TRANSFORM':
                if (!element) element = this._elementHash[path];

                for (var i = 0; i < 16; i++) {
                    this._meshTransform[i] = commands[commands.index++];
                }
                element.setMatrix.apply(element, this._meshTransform);
                if (this.WebGLRenderer) this.WebGLRenderer.setCutoutUniform(path, 'transform', this._meshTransform);
                break;

            case 'CHANGE_SIZE':
                if (!element) element = this._elementHash[path];
                var width = commands[commands.index++];
                var height = commands[commands.index++];

                element.changeSize(width, height);
                if (this.WebGLRenderer) {
                    this._meshSize[0] = width;
                    this._meshSize[1] = height;
                    this.WebGLRenderer.setCutoutUniform(path, 'size', this._meshSize);
                }
                break;

            case 'CHANGE_PROPERTY':
                if (!element) element = this._elementHash[path];
                if (this.WebGLRenderer) this.WebGLRenderer.getOrSetCutout(path);
                element.setProperty(commands[commands.index++], commands[commands.index++]);
                break;

            case 'CHANGE_CONTENT':
                if (!element) element = this._elementHash[path];
                if (this.WebGLRenderer) this.WebGLRenderer.getOrSetCutout(path);
                element.setContent(commands[commands.index++]);
                break;

            case 'CHANGE_ATTRIBUTE':
                if (!element) element = this._elementHash[path];
                if (this.WebGLRenderer) this.WebGLRenderer.getOrSetCutout(path);
                element.setAttribute(commands[commands.index++], commands[commands.index++]);
                break;

            case 'ADD_CLASS':
                if (!element) element = this._elementHash[path];
                if (this.WebGLRenderer) this.WebGLRenderer.getOrSetCutout(path);
                element.addClass(commands[commands.index++]);
                break;

            case 'REMOVE_CLASS':
                if (!element) element = this._elementHash[path];
                if (this.WebGLRenderer) this.WebGLRenderer.getOrSetCutout(path);
                element.removeClass(commands[commands.index++]);
                break;

            case 'ADD_EVENT_LISTENER':
                if (!element) element = this._elementHash[path];
                if (this.WebGLRenderer) this.WebGLRenderer.getOrSetCutout(path);
                var ev = commands[commands.index++];
                var methods;
                var properties;
                var c;
                while ((c = commands[commands.index++]) !== 'EVENT_PROPERTIES') methods = c;
                while ((c = commands[commands.index++]) !== 'EVENT_END') properties = c;
                methods = methods || [];
                properties = properties || [];
                element.addEventListener(ev, element.dispatchEvent.bind(element, ev, methods, properties));
                break;

            case 'RECALL':
                if (!element) element = this._elementHash[path];
                element.setProperty('display', 'none');
                element._parent._allocator.deallocate(element._target);
                this._renderers.splice(this._renderers.indexOf(element), 1);
                delete this._elementHash[path];
                break;

            case 'GL_SET_DRAW_OPTIONS': 
                if (!this.WebGLRenderer) this.initWebGL();
                this.WebGLRenderer.setMeshOptions(path, commands[commands.index++]);
                break;

            case 'GL_AMBIENT_LIGHT':
                if (!this.WebGLRenderer) this.initWebGL();
                this.WebGLRenderer.setAmbientLightColor(
                    path,
                    commands[commands.index++],
                    commands[commands.index++],
                    commands[commands.index++]
                );
                break;

            case 'GL_LIGHT_POSITION':
                if (!this.WebGLRenderer) this.initWebGL();
                this.WebGLRenderer.setLightPosition(
                    path,
                    commands[commands.index++],
                    commands[commands.index++],
                    commands[commands.index++]
                );
                break;

            case 'GL_LIGHT_COLOR':
                if (!this.WebGLRenderer) this.initWebGL();
                this.WebGLRenderer.setLightColor(
                    path,
                    commands[commands.index++],
                    commands[commands.index++],
                    commands[commands.index++]
                );
                break;

            case 'MATERIAL_INPUT':
                if (!this.WebGLRenderer) this.initWebGL();
                this.WebGLRenderer.handleMaterialInput(
                    path,
                    commands[commands.index++],
                    commands[commands.index++]
                );
                break;

            case 'GL_SET_GEOMETRY':
                if (!this.WebGLRenderer) this.initWebGL();
                this.WebGLRenderer.setGeometry(
                    path,
                    commands[commands.index++],
                    commands[commands.index++],
                    commands[commands.index++]
                );
                break;

            case 'GL_UNIFORMS':
                if (!this.WebGLRenderer) this.initWebGL();
                this.WebGLRenderer.setMeshUniform(
                    path,
                    commands[commands.index++],
                    commands[commands.index++]
                );
                break;

            case 'GL_BUFFER_DATA':
                if (!this.WebGLRenderer) this.initWebGL();
                this.WebGLRenderer.bufferData(
                    path,
                    commands[commands.index++],
                    commands[commands.index++],
                    commands[commands.index++],
                    commands[commands.index++]
                );
                break;

            case 'PINHOLE_PROJECTION':
                this._renderState.projectionType = Camera.PINHOLE_PROJECTION;
                this._renderState.perspectiveTransform[11] = -1 / commands[commands.index++];
                break;

            case 'ORTHOGRAPHIC_PROJECTION':
                this._renderState.projectionType = Camera.ORTHOGRAPHIC_PROJECTION;
                this._renderState.perspectiveTransform[11] = 0;
                break;

            case 'CHANGE_VIEW_TRANSFORM':
                this._renderState.viewTransform[0] = commands[commands.index++];
                this._renderState.viewTransform[1] = commands[commands.index++];
                this._renderState.viewTransform[2] = commands[commands.index++];
                this._renderState.viewTransform[3] = commands[commands.index++];

                this._renderState.viewTransform[4] = commands[commands.index++];
                this._renderState.viewTransform[5] = commands[commands.index++];
                this._renderState.viewTransform[6] = commands[commands.index++];
                this._renderState.viewTransform[7] = commands[commands.index++];

                this._renderState.viewTransform[8] = commands[commands.index++];
                this._renderState.viewTransform[9] = commands[commands.index++];
                this._renderState.viewTransform[10] = commands[commands.index++];
                this._renderState.viewTransform[11] = commands[commands.index++];

                this._renderState.viewTransform[12] = commands[commands.index++];
                this._renderState.viewTransform[13] = commands[commands.index++];
                this._renderState.viewTransform[14] = commands[commands.index++];
                this._renderState.viewTransform[15] = commands[commands.index++];
                break;

            case 'WITH': return commands.index--;
        }

        command = commands[commands.index++];
    }
};

module.exports = Context;
