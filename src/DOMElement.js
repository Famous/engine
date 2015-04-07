
function DOMElement (node, tagName) {
    this._node = node;
    this._path = null;

    this._requestingUpdate = false;

    this._changeQueue = [];
    
    this._classes = [];
    this._requestingEventListeners = [];
    this._styles = {};
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

DOMElement.prototype.onMount = function onMount (node, path, id) {
    this._node = node;
    this._path = path;
    this._id = id;
    this.draw();
};

DOMElement.prototype.onDismount = function onDismount () {
    this._recall();
};

DOMElement.prototype.onShow = function onShow () {
    this.setProperty('display', 'block');
};

DOMElement.prototype.onHide = function onHide () {
    this.setProperty('display', 'none');
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
    if (sizedX) this.setProperty('width', size[0] + 'px');
    if (sizedY) this.setProperty('height', size[1] + 'px');
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
    if (!this._requestingUpdate) this._requestUpdate();
};

DOMElement.prototype.setID = function setID (id) {
    this.setAttribute('ID', id);
};

DOMElement.prototype.addClass = function addClass (value) {
    if (this._classes.indexOf(value) < 0) {
        this._changeQueue.push('ADD_CLASS', value);
        this._classes.push(value);
        if (!this._requestingUpdate) this._requestUpdate();
        return;
    }

    if (this._inDraw) {
        this._changeQueue.push('ADD_CLASS', value);
        if (!this._requestingUpdate) this._requestUpdate();
    }
};

DOMElement.prototype.removeClass = function removeClass (value) {
    var index = this._classes.indexOf(value);

    if (index < 0) return;

    this._changeQueue.push('REMOVE_CLASS', value);

    this._classes.splice(index, 1);

    if (!this._requestingUpdate) this._requestUpdate();
};

DOMElement.prototype.setAttribute = function setAttribute (name, value) {
    if (this._attributes[name] !== value || this._inDraw) {
        this._attributes[name] = value;
        this._changeQueue.push('CHANGE_ATTRIBUTE', name, value);
        if (!this._requestUpdate) this._requestUpdate();
    }
};

DOMElement.prototype.setProperty = function setProperty (name, value) {
    if (this._styles[name] !== value || this._inDraw) {
        this._styles[name] = value;
        this._changeQueue.push('CHANGE_PROERPTY', name, value);
        if (!this._requestingUpdate) this._requestUpdate();
    }
};

DOMElement.prototype.draw = function draw () {
    var key;
    var i;
    var len;

    this._inDraw = true;

    this.init();

    for (i = 0, len = this._classes.length ; i < len ; i++)
        this.addClass(this._classes[i]);
    
    for (key in this._styles) 
        if (this._styles[key])
            this.setProperty(key, this._styles[key]);

    for (key in this._attributes)
        if (this._attributes[key])
            this.setAttribute(key, value);

};

module.exports = DOMElement;

