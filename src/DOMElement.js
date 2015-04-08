
function DOMElement (node, tagName) {
    this._node = node;

    this._requestingUpdate = false;

    this._changeQueue = [];
    
    this._classes = ['fa-surface'];
    this._requestingEventListeners = [];
    this._styles = {
        display: 'none' 
    };
    this._attributes = {};
    this._content = null;

    this._tagName = tagName ? tagName : 'div';
    this._id = node.addComponent(this);
}

DOMElement.prototype.getValue = function getValue () {
    return {
        classes: this._classes,
        styles: this._styles,
        attributes: this._attributes,
        content: this._content
    };
};

DOMElement.prototype.onUpdate = function onUpdate () {
    var node = this._node;
    var queue = this._changeQueue;
    var len = queue.length;

    if (len && node) {
        node.sendDrawCommand('WITH');
        node.sendDrawCommand(node.getLocation());
        node.sendDrawCommand('DOM');

        while (len--) node.sendDrawCommand(queue.shift());
    }

    this._requestingUpdate = false;
};

DOMElement.prototype.onMount = function onMount (node, id) {
    this._node = node;
    this._id = id;
    this.draw();
    this.setAttribute('data-fa-path', node.getLocation());
};

DOMElement.prototype.onDismount = function onDismount () {
    this.setProperty('display', 'none');
    this.setAttribute('data-fa-path', '');
    this._changeQueue.push('RECALL');
    this._initialized = false;
};

DOMElement.prototype.onShow = function onShow () {
    this.setProperty('display', 'block');
};

DOMElement.prototype.onHide = function onHide () {
    this.setProperty('display', 'none');
    this._changeQueue.push('RECALL');
};

DOMElement.prototype.onTransformChange = function onTransformChange (transform) {
    this._changeQueue.push('CHANGE_TRANSFORM');
    for (var i = 0, len = transform.length ; i < len ; i++)
        this._changeQueue.push(transform[i]);

    if (!this._requestingUpdate) this._requestUpdate();
};

DOMElement.prototype.onSizeChange = function onSizeChange (size) {
    var sizeMode = this._node.getSizeMode();
    var sizedX = sizeMode[0] !== Node.RENDER_SIZE;
    var sizedY = sizeMode[1] !== Node.RENDER_SIZE;
    this._changeQueue.push('CHANGE_SIZE',
            sizedX ? size[0] : sizedX,
            sizedY ? size[1] : sizedY);

    if (!this._requestingUpdate) this._requestUpdate();
    return this;
};

DOMElement.prototype.onAddUIEvent = function onAddUIEvent (UIEvent, methods, properties) {
    this._changeQueue.push('ADD_EVENT_LISTERNER', UIEvent);
    if (methods != null) this._changeQueue.push(methods);
    if (properties != null) this._changeQueue.push(properties);
    if (!this._requestingUpdate) this._requestUpdate();
    this._changeQueue.push('EVENT_END');
};

DOMElement.prototype.onSizeModeChange = function onSizeModeChange (sizeMode) {
    var size = this._node.getSize();
    var sizedX = sizeMode[0] !== Node.RENDER_SIZE;
    var sizedY = sizeMode[1] !== Node.RENDER_SIZE;
    if (sizedX) this.setProperty('width', size[0] + 'px');
    if (sizedY) this.setProperty('height', size[1] + 'px');
}; 

DOMElement.prototype._requestUpdate = function _requestUpdate () {
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }
};

DOMElement.prototype.init = function init () {
    this._changeQueue.push('INIT_DOM', this._tagName);
    this._initialized = true;
    this.onTransformChange(this._node.getTransform());
    this.onSizeChange(this._node.getSize());
    if (!this._requestingUpdate) this._requestUpdate();
};

DOMElement.prototype.setID = function setID (id) {
    this.setAttribute('id', id);
    return this;
};

DOMElement.prototype.addClass = function addClass (value) {
    if (this._classes.indexOf(value) < 0) {
        if (this._initialized) this._changeQueue.push('ADD_CLASS', value);
        this._classes.push(value);
        if (!this._requestingUpdate) this._requestUpdate();
        return this;
    }

    if (this._inDraw) {
        if (this._initialized) this._changeQueue.push('ADD_CLASS', value);
        if (!this._requestingUpdate) this._requestUpdate();
    }
    return this;
};

DOMElement.prototype.removeClass = function removeClass (value) {
    var index = this._classes.indexOf(value);

    if (index < 0) return this;

    this._changeQueue.push('REMOVE_CLASS', value);

    this._classes.splice(index, 1);

    if (!this._requestingUpdate) this._requestUpdate();
    return this;
};

DOMElement.prototype.setAttribute = function setAttribute (name, value) {
    if (this._attributes[name] !== value || this._inDraw) {
        this._attributes[name] = value;
        if (this._initialized) this._changeQueue.push('CHANGE_ATTRIBUTE', name, value);
        if (!this._requestUpdate) this._requestUpdate();
    }
    return this;
};

DOMElement.prototype.setProperty = function setProperty (name, value) {
    if (this._styles[name] !== value || this._inDraw) {
        this._styles[name] = value;
        if (this._initialized) this._changeQueue.push('CHANGE_PROPERTY', name, value);
        if (!this._requestingUpdate) this._requestUpdate();
    }
    return this;
};

DOMElement.prototype.setContent = function setContent (content) {
    if (this._content !== content || this._inDraw) {
        this._content = content;
        if (this._initialized) this._changeQueue.push('CHANGE_CONTENT', content);
        if (!this._requestingUpdate) this._requestUpdate();
    }
    return this;
};

DOMElement.prototype.draw = function draw () {
    var key;
    var i;
    var len;

    this._inDraw = true;

    this.init();

    for (i = 0, len = this._classes.length ; i < len ; i++)
        this.addClass(this._classes[i]);

    this.setContent(this._content);

    for (key in this._styles) 
        if (this._styles[key])
            this.setProperty(key, this._styles[key]);

    for (key in this._attributes)
        if (this._attributes[key])
            this.setAttribute(key, this._attributes[key]);

    this._inDraw = false;
};

module.exports = DOMElement;

