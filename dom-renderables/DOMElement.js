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

var CallbackStore = require('../utilities/CallbackStore');

var ComponentFactory = require('../components/ComponentFactory');
ComponentFactory.register(DOMElement);

var RENDER_SIZE = 2;
var DEFAULT_CLASSES = ['famous-dom-element'];
var EMPTY_CLASS = {}; // Avoid garbage collection.
var EMPTY_ARRAY = []; // Avoid garbage collection.

/**
 * A DOMElement is a component that can be added to a Node with the
 * purpose of sending draw commands to the renderer. Renderables send draw commands
 * to through their Nodes to the Compositor where they are acted upon.
 *
 * @class DOMElement
 *
 * @param {Node} node                   The Node to which the `DOMElement`
 *                                      renderable should be attached to.
 * @param {Object} options              Initial options used for instantiating
 *                                      the Node.
 *
 * @param {Object} options.tagName      The tagName of the renderable.
 *
 * @param {Object} options.properties   CSS properties that should be added to
 *                                      the actual DOMElement on the initial draw.
 * @param {Object} options.attributes   Element attributes that should be added to
 *                                      the actual DOMElement.
 * @param {String} options.id           String to be applied as 'id' of the actual
 *                                      DOMElement.
 * @param {String} options.content      String to be applied as the content of the
 *                                      actual DOMElement.
 * @param {Boolean} options.cutout      Specifies the presence of a 'cutout' in the
 *                                      WebGL canvas over this element which allows
 *                                      for DOM and WebGL layering.  On by default.
 */
function DOMElement(node, options) {
    if (!node) throw new Error('DOMElement must be instantiated on a node');

    this._node = node;

    this._requestingUpdate = false;
    this._renderSized = false;
    this._requestRenderSize = false;

    this._changeQueue = [];

    this._UIEvents = node.getUIEvents().slice(0);
    this._classes = ['famous-dom-element'];
    this._requestingEventListeners = [];
    this._styles = {};

    this.setProperty('display', node.isShown() ? 'none' : 'block');
    this.onOpacityChange(node.getOpacity());

    this._attributes = {};
    this._content = '';

    this._tagName = options && options.tagName ? options.tagName : 'div';
    this._id = node.addComponent(this);

    this._renderSize = [0, 0, 0];
    this.onSizeModeChange.apply(this, node.getSizeMode());

    this._callbacks = new CallbackStore();

    if (!options) return;

    var i;
    var key;

    if (options.classes)
        for (i = 0; i < options.classes.length; i++)
            this.addClass(options.classes[i]);

    if (options.attributes)
        for (key in options.attributes)
            this.setAttribute(key, options.attributes[key]);

    if (options.properties)
        for (key in options.properties)
            this.setProperty(key, options.properties[key]);

    if (options.id) this.setId(options.id);
    if (options.content) this.setContent(options.content);
    if (options.cutout === false) this.setCutoutState(options.cutout);
};

/**
 * Serializes the state of the DOMElement.
 *
 * @method
 *
 * @return {Object} serialized interal state
 */
DOMElement.prototype.getValue = function getValue() {
    return {
        classes: this._classes,
        styles: this._styles,
        attributes: this._attributes,
        content: this._content,
        id: this._attributes.id,
        tagName: this._tagName
    };
};

/**
 * Serializes the DOMElement.  This version is intended as a human editable and
 * diff friendly file format.
 *
 * @method serialize
 *
 * @return {Object}     Serialized representation.
 */
DOMElement.prototype._serialize = function _serialize() {
    var key, result = { _type:"DOMElement", _version:1 };

    if(this._tagName !== 'div') result.tagName = this._tagName;
    if(this._content !== '') result.content = this._content;

    for (key in this._attributes) {
        if (key === 'data-fa-path' || this._attributes[key] === '')
            continue;
        result.attributes = result.attributes || { };
        result.attributes[key] = this._attributes[key];
    }

    // Record absense of default class.
    if(this._classes.length != 1 || this._classes[0] !== DEFAULT_CLASSES[0])
        result.classes = this._classes;

    for (key in this._styles) {
        if (!this._styles[key] || key === 'display' || key === 'opacity')
            continue;
        result.properties = result.properties || { };
        result.properties[key] = this._styles[key];
    }

    return result;
};

/**
 * Deserialize the DOMElement.  This version should only be used to animate properties.
 * To construct a new DOMElement (required for tagName changes) pass the JSON to the constructor.
 *
 * @method deserialize
 *
 * @param  {Object} json representation to deserialize
 * @param  {Object} overlayDefaults whether to reset properties that are not provided.
 *
 * @return {Node} this
 */
DOMElement.prototype._deserialize = function _deserialize(json, overlayDefaults) {
    var i, key;
    var classes = json.classes || (overlayDefaults ? DEFAULT_CLASSES : EMPTY_ARRAY);
    var attributes = json.attributes || EMPTY_CLASS;
    var properties = json.properties || EMPTY_CLASS;

    if(json._type !== 'DOMElement' || json._version != 1)
        throw new Error('expected JSON serialized DOMElement version 1');
    if(json.tagName && json.tagName !== this.tagName)
        throw new Error('cannot change tagName');

    if(overlayDefaults) {
        len = this._classes.length;
        for (i = 0; i < len; ++i)
            if (classes.indexOf(this._classes[i]) < 0)
                this.removeClass(this._classes[i]);
        for (key in this._attributes)
            if (key !== 'data-fa-path' && !attributes[key])
                this.setAttribute(key, '');
        for (key in this._styles)
            if (key !== 'display' && key !== 'opacity' && !properties[key])
                this.setProperty(key, '');
        if (!json.content) this.setContent('');
    }

    len = classes.length;
    for (i = 0; i < len; ++i)
        this.addClass(classes[i]);
    for (key in attributes)
        this.setAttribute(key, attributes[key]);
    for (key in properties)
        this.setProperty(key, properties[key]);
    if (json.content) this.setContent(json.content);

    return result;
};

/**
 * Method to be invoked by the node as soon as an update occurs. This allows
 * the DOMElement renderable to dynamically react to state changes on the Node.
 *
 * This flushes the internal draw command queue by sending individual commands
 * to the node using `sendDrawCommand`.
 *
 * @method
 *
 * @return {undefined} undefined
 */
DOMElement.prototype.onUpdate = function onUpdate() {
    var node = this._node;
    var queue = this._changeQueue;
    var len = queue.length;

    if (len && node) {
        node.sendDrawCommand('WITH');
        node.sendDrawCommand(node.getLocation());

        while (len--) node.sendDrawCommand(queue.shift());
        if (this._requestRenderSize) {
            node.sendDrawCommand('DOM_RENDER_SIZE');
            node.sendDrawCommand(node.getLocation());
            this._requestRenderSize = false;
        }

    }

    this._requestingUpdate = false;
};

/**
 * Method to be invoked by the Node as soon as the node (or any of its
 * ancestors) is being mounted.
 *
 * @method onMount
 *
 * @param {Node} node      Parent node to which the component should be added.
 * @param {String} id      Path at which the component (or node) is being
 *                          attached. The path is being set on the actual
 *                          DOMElement as a `data-fa-path`-attribute.
 *
 * @return {undefined} undefined
 */
DOMElement.prototype.onMount = function onMount(node, id) {
    this._node = node;
    this._id = id;
    this._UIEvents = node.getUIEvents().slice(0);
    this.draw();
    this.setAttribute('data-fa-path', node.getLocation());
};

/**
 * Method to be invoked by the Node as soon as the node is being dismounted
 * either directly or by dismounting one of its ancestors.
 *
 * @method
 *
 * @return {undefined} undefined
 */
DOMElement.prototype.onDismount = function onDismount() {
    this.setProperty('display', 'none');
    this.setAttribute('data-fa-path', '');
    this.setCutoutState(false);

    this._initialized = false;
};

/**
 * Method to be invoked by the node as soon as the DOMElement is being shown.
 * This results into the DOMElement setting the `display` property to `block`
 * and therefore visually showing the corresponding DOMElement (again).
 *
 * @method
 *
 * @return {undefined} undefined
 */
DOMElement.prototype.onShow = function onShow() {
    this.setProperty('display', 'block');
};

/**
 * Method to be invoked by the node as soon as the DOMElement is being hidden.
 * This results into the DOMElement setting the `display` property to `none`
 * and therefore visually hiding the corresponding DOMElement (again).
 *
 * @method
 *
 * @return {undefined} undefined
 */
DOMElement.prototype.onHide = function onHide() {
    this.setProperty('display', 'none');
};

/**
 * Enables or disables WebGL 'cutout' for this element, which affects
 * how the element is layered with WebGL objects in the scene.
 *
 * @method
 *
 * @param {Boolean} usesCutout  The presence of a WebGL 'cutout' for this element.
 *
 * @return {DOMElement} this
 */
DOMElement.prototype.setCutoutState = function setCutoutState(usesCutout) {
    if (this._initialized)
        this._changeQueue.push('GL_CUTOUT_STATE', usesCutout);

    if (!this._requestingUpdate) this._requestUpdate();
    return this;
};

/**
 * Method to be invoked by the node as soon as the transform matrix associated
 * with the node changes. The DOMElement will react to transform changes by sending
 * `CHANGE_TRANSFORM` commands to the `DOMRenderer`.
 *
 * @method
 *
 * @param {Float32Array} transform The final transform matrix
 *
 * @return {undefined} undefined
 */
DOMElement.prototype.onTransformChange = function onTransformChange (transform) {
    this._changeQueue.push('CHANGE_TRANSFORM');
    for (var i = 0, len = transform.length ; i < len ; i++)
        this._changeQueue.push(transform[i]);

    this.onUpdate();
};

/**
 * Method to be invoked by the node as soon as its computed size changes.
 *
 * @method
 *
 * @param {Float32Array} size Size of the Node in pixels
 *
 * @return {DOMElement} this
 */
DOMElement.prototype.onSizeChange = function onSizeChange(size) {
    var sizeMode = this._node.getSizeMode();
    var sizedX = sizeMode[0] !== RENDER_SIZE;
    var sizedY = sizeMode[1] !== RENDER_SIZE;
    if (this._initialized)
        this._changeQueue.push('CHANGE_SIZE',
            sizedX ? size[0] : sizedX,
            sizedY ? size[1] : sizedY);

    if (!this._requestingUpdate) this._requestUpdate();
    return this;
};

/**
 * Method to be invoked by the node as soon as its opacity changes
 *
 * @method
 *
 * @param {Number} opacity The new opacity, as a scalar from 0 to 1
 *
 * @return {DOMElement} this
 */
DOMElement.prototype.onOpacityChange = function onOpacityChange(opacity) {
    return this.setProperty('opacity', opacity);
};

/**
 * Method to be invoked by the node as soon as a new UIEvent is being added.
 * This results into an `ADD_EVENT_LISTENER` command being sent.
 *
 * @param {String} uiEvent uiEvent to be subscribed to (e.g. `click`)
 *
 * @return {undefined} undefined
 */
DOMElement.prototype.onAddUIEvent = function onAddUIEvent(uiEvent) {
    if (this._UIEvents.indexOf(uiEvent) === -1) {
        this._subscribe(uiEvent);
        this._UIEvents.push(uiEvent);
    }
    else if (this._inDraw) {
        this._subscribe(uiEvent);
    }
    return this;
};

/**
 * Appends an `ADD_EVENT_LISTENER` command to the command queue.
 *
 * @method
 * @private
 *
 * @param {String} uiEvent Event type (e.g. `click`)
 *
 * @return {undefined} undefined
 */
DOMElement.prototype._subscribe = function _subscribe (uiEvent) {
    if (this._initialized) {
        this._changeQueue.push('SUBSCRIBE', uiEvent);
    }
    if (!this._requestingUpdate) this._requestUpdate();
};

/**
 * When running in a worker, the browser's default action for specific events
 * can't be prevented on a case by case basis (via `e.preventDefault()`).
 * Instead this function should be used to register an event to be prevented by
 * default.
 *
 * @method
 *
 * @param  {String} uiEvent     UI Event (e.g. wheel) for which to prevent the
 *                              browser's default action (e.g. form submission,
 *                              scrolling)
 * @return {undefined}          undefined
 */
DOMElement.prototype.preventDefault = function preventDefault (uiEvent) {
    if (this._initialized) {
        this._changeQueue.push('PREVENT_DEFAULT', uiEvent);
    }
    if (!this._requestingUpdate) this._requestUpdate();
};

/**
 * Opposite of {@link DOMElement#preventDefault}. No longer prevent the
 * browser's default action on subsequent events of this type.
 *
 * @method
 *
 * @param  {type} uiEvent       UI Event previously registered using
 *                              {@link DOMElement#preventDefault}.
 * @return {undefined}          undefined
 */
DOMElement.prototype.allowDefault = function allowDefault (uiEvent) {
    if (this._initialized) {
        this._changeQueue.push('ALLOW_DEFAULT', uiEvent);
    }
    if (!this._requestingUpdate) this._requestUpdate();
};

/**
 * Method to be invoked by the node as soon as the underlying size mode
 * changes. This results into the size being fetched from the node in
 * order to update the actual, rendered size.
 *
 * @method
 *
 * @param {Number} x the sizing mode in use for determining size in the x direction
 * @param {Number} y the sizing mode in use for determining size in the y direction
 * @param {Number} z the sizing mode in use for determining size in the z direction
 *
 * @return {undefined} undefined
 */
DOMElement.prototype.onSizeModeChange = function onSizeModeChange(x, y, z) {
    if (x === RENDER_SIZE || y === RENDER_SIZE || z === RENDER_SIZE) {
        this._renderSized = true;
        this._requestRenderSize = true;
    }
    this.onSizeChange(this._node.getSize());
};

/**
 * Method to be retrieve the rendered size of the DOM element that is
 * drawn for this node.
 *
 * @method
 *
 * @return {Array} size of the rendered DOM element in pixels
 */
DOMElement.prototype.getRenderSize = function getRenderSize() {
    return this._renderSize;
};

/**
 * Method to have the component request an update from its Node
 *
 * @method
 * @private
 *
 * @return {undefined} undefined
 */
DOMElement.prototype._requestUpdate = function _requestUpdate() {
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }
};

/**
 * Initializes the DOMElement by sending the `INIT_DOM` command. This creates
 * or reallocates a new Element in the actual DOM hierarchy.
 *
 * @method
 *
 * @return {undefined} undefined
 */
DOMElement.prototype.init = function init() {
    this._changeQueue.push('INIT_DOM', this._tagName);
    this._initialized = true;
    this.onTransformChange(this._node.getTransform());
    this.onSizeChange(this._node.getSize());
    if (!this._requestingUpdate) this._requestUpdate();
};

/**
 * Sets the id attribute of the DOMElement.
 *
 * @method
 *
 * @param {String} id New id to be set
 *
 * @return {DOMElement} this
 */
DOMElement.prototype.setId = function setId (id) {
    this.setAttribute('id', id);
    return this;
};

/**
 * Adds a new class to the internal class list of the underlying Element in the
 * DOM.
 *
 * @method
 *
 * @param {String} value New class name to be added
 *
 * @return {DOMElement} this
 */
DOMElement.prototype.addClass = function addClass (value) {
    if (this._classes.indexOf(value) < 0) {
        if (this._initialized) this._changeQueue.push('ADD_CLASS', value);
        this._classes.push(value);
        if (!this._requestingUpdate) this._requestUpdate();
        if (this._renderSized) this._requestRenderSize = true;
        return this;
    }

    if (this._inDraw) {
        if (this._initialized) this._changeQueue.push('ADD_CLASS', value);
        if (!this._requestingUpdate) this._requestUpdate();
    }
    return this;
};

/**
 * Removes a class from the DOMElement's classList.
 *
 * @method
 *
 * @param {String} value Class name to be removed
 *
 * @return {DOMElement} this
 */
DOMElement.prototype.removeClass = function removeClass (value) {
    var index = this._classes.indexOf(value);

    if (index < 0) return this;

    this._changeQueue.push('REMOVE_CLASS', value);

    this._classes.splice(index, 1);

    if (!this._requestingUpdate) this._requestUpdate();
    return this;
};


/**
 * Checks if the DOMElement has the passed in class.
 *
 * @method
 *
 * @param {String} value The class name
 *
 * @return {Boolean} Boolean value indicating whether the passed in class name is in the DOMElement's class list.
 */
DOMElement.prototype.hasClass = function hasClass (value) {
    return this._classes.indexOf(value) !== -1;
};

/**
 * Sets an attribute of the DOMElement.
 *
 * @method
 *
 * @param {String} name Attribute key (e.g. `src`)
 * @param {String} value Attribute value (e.g. `http://famo.us`)
 *
 * @return {DOMElement} this
 */
DOMElement.prototype.setAttribute = function setAttribute (name, value) {
    if (this._attributes[name] !== value || this._inDraw) {
        this._attributes[name] = value;
        if (this._initialized) this._changeQueue.push('CHANGE_ATTRIBUTE', name, value);
        if (!this._requestUpdate) this._requestUpdate();
    }

    return this;
};

/**
 * Sets a CSS property
 *
 * @chainable
 *
 * @param {String} name  Name of the CSS rule (e.g. `background-color`)
 * @param {String} value Value of CSS property (e.g. `red`)
 *
 * @return {DOMElement} this
 */
DOMElement.prototype.setProperty = function setProperty (name, value) {
    if (this._styles[name] !== value || this._inDraw) {
        this._styles[name] = value;
        if (this._initialized) this._changeQueue.push('CHANGE_PROPERTY', name, value);
        if (!this._requestingUpdate) this._requestUpdate();
        if (this._renderSized) this._requestRenderSize = true;
    }

    return this;
};

/**
 * Sets the content of the DOMElement. This is using `innerHTML`, escaping user
 * generated content is therefore essential for security purposes.
 *
 * @method
 *
 * @param {String} content Content to be set using `.innerHTML = ...`
 *
 * @return {DOMElement} this
 */
DOMElement.prototype.setContent = function setContent (content) {
    if (this._content !== content || this._inDraw) {
        this._content = content;
        if (this._initialized) this._changeQueue.push('CHANGE_CONTENT', content);
        if (!this._requestingUpdate) this._requestUpdate();
        if (this._renderSized) this._requestRenderSize = true;
    }

    return this;
};

/**
 * Subscribes to a DOMElement using.
 *
 * @method on
 *
 * @param {String} event       The event type (e.g. `click`).
 * @param {Function} listener  Handler function for the specified event type
 *                              in which the payload event object will be
 *                              passed into.
 *
 * @return {Function} A function to call if you want to remove the callback
 */
DOMElement.prototype.on = function on (event, listener) {
    return this._callbacks.on(event, listener);
};

/**
 * Function to be invoked by the Node whenever an event is being received.
 * There are two different ways to subscribe for those events:
 *
 * 1. By overriding the onReceive method (and possibly using `switch` in order
 *     to differentiate between the different event types).
 * 2. By using DOMElement and using the built-in CallbackStore.
 *
 * @method
 *
 * @param {String} event Event type (e.g. `click`)
 * @param {Object} payload Event object.
 *
 * @return {undefined} undefined
 */
DOMElement.prototype.onReceive = function onReceive (event, payload) {
    if (event === 'resize') {
        this._renderSize[0] = payload.val[0];
        this._renderSize[1] = payload.val[1];
        if (!this._requestingUpdate) this._requestUpdate();
    }
    this._callbacks.trigger(event, payload);
};

/**
 * The draw function is being used in order to allow mutating the DOMElement
 * before actually mounting the corresponding node.
 *
 * @method
 * @private
 *
 * @return {undefined} undefined
 */
DOMElement.prototype.draw = function draw() {
    var key;
    var i;
    var len;

    this._inDraw = true;

    this.init();

    for (i = 0, len = this._classes.length ; i < len ; i++)
        this.addClass(this._classes[i]);

    if (this._content) this.setContent(this._content);

    for (key in this._styles)
        if (this._styles[key])
            this.setProperty(key, this._styles[key]);

    for (key in this._attributes)
        if (this._attributes[key])
            this.setAttribute(key, this._attributes[key]);

    for (i = 0, len = this._UIEvents.length ; i < len ; i++)
        this.onAddUIEvent(this._UIEvents[i]);

    this._inDraw = false;
};

module.exports = DOMElement;
