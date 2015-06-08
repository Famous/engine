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

var RENDER_SIZE = 2;

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
    this._node = null;
    this._id = null;

    this._requestingUpdate = false;
    this._renderSized = false;
    this._requestingRenderSize = false;

    this._changeQueue = [];

    this._callbackStore = new CallbackStore();

    this.value = new DOMElement.Spec(options);

    if (node)
        node.addComponent(this);
}

DOMElement.Spec = function Spec(options) {
    options = options || {};

    this.tagName = options.tagName ? options.tagName.toUpperCase() : 'DIV';
    this.renderSize = new Uint32Array(2);
    this.classes = options.classes || {};
    this.attributes = options.attributes || {};
    this.properties = options.properties || {};
    this.content = options.content || '';
    this.cutout = options.cutout != null ? options.cutout : true;

    this.classes['famous-dom-element'] = true;

    // DEPRECATE
    if (options.id)
        this.attributes.id = options.id;
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
        tagName: this.value.tagName,
        renderSize: this.value.renderSize,
        classes: Object.keys(this.value.classes),
        attributes: this.value.attributes,
        properties: this.value.properties,
        content: this.value.content,
        cutout: this.value.cutout,

        // DEPRECATE
        styles: this.value.properties,
        id: this.value.attributes.id
    };
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
    if (this._initialized) {
        var node = this._node;
        var queue = this._changeQueue;
        var len = queue.length;
        var location = node.getLocation();

        if (len && node) {
            node.sendDrawCommand('WITH');
            node.sendDrawCommand(location);

            while (len--)
                node.sendDrawCommand(queue.shift());
            if (this._requestingRenderSize) {
                node.sendDrawCommand('DOM_RENDER_SIZE');
                node.sendDrawCommand(location);
                this._requestingRenderSize = false;
            }

        }

        this._requestingUpdate = false;
    }
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

    var key;
    var val;
    var i;
    var len;

    this._initialized = true;
    this._inDraw = true;

    this._changeQueue.push(
        'INIT_DOM',
        this.value.tagName
    );

    for (key in this.value.classes)
        if (this.value.classes[key])
            this.addClass(key);

    for (key in this.value.properties) {
        val = this.value.properties[key];
        if (val)
            this.setProperty(key, val);
    }

    for (key in this.value.attributes) {
        val = this.value.attributes[key];
        if (val)
            this.setAttribute(key, val);
    }

    if (this.value.content)
        this.setContent(this.value.content);

    var uiEvents = node.getUIEvents();
    for (i = 0, len = uiEvents.length; i < len; i++)
        this.onAddUIEvent(uiEvents[i]);

    this.setAttribute('data-fa-path', node.getLocation());

    var sizeMode = node.getSizeMode();
    this.onSizeModeChange(sizeMode[0], sizeMode[1], sizeMode[2]);
    this.onSizeChange(node.getSize());
    this.onOpacityChange(node.getOpacity());
    this.onTransformChange(node.getTransform());

    this._inDraw = false;
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
    this._initialized = false;

    // TODO Complete cleanup.
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
 * how the element is layered with WebGL objects in the scene.  This is designed
 * mainly as a way to acheive
 *
 * @method
 *
 * @param {Boolean} usesCutout  The presence of a WebGL 'cutout' for this element.
 *
 * @return {undefined} undefined
 */
DOMElement.prototype.setCutoutState = function setCutoutState(usesCutout) {
    if (this.value.cutout !== usesCutout || this._inDraw) {
        this.value.cutout = usesCutout;
        if (this._initialized)
            this._changeQueue.push('GL_CUTOUT_STATE', usesCutout);
        this._requestUpdate();
    }

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
    if (this._initialized) {
        this._changeQueue.push(
            'CHANGE_TRANSFORM',
            transform[0],
            transform[1],
            transform[2],
            transform[3],
            transform[4],
            transform[5],
            transform[6],
            transform[7],
            transform[8],
            transform[9],
            transform[10],
            transform[11],
            transform[12],
            transform[13],
            transform[14],
            transform[15]
        );

        // HACK, should be onTransformChange, but needed to ensure that nested
        // DOMElements don't lag behind
        this.onUpdate();
    }

    return this;
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
    if (this._initialized) {
        var sizeMode = this._node.getSizeMode();
        var sizedX = sizeMode[0] !== RENDER_SIZE;
        var sizedY = sizeMode[1] !== RENDER_SIZE;
        this._changeQueue.push(
            'CHANGE_SIZE',
            sizedX ? size[0] : sizedX,
            sizedY ? size[1] : sizedY
        );
    }

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
 * @param {String} uiEvent UIEvent to be subscribed to (e.g. `click`)
 *
 * @return {undefined} undefined
 */
DOMElement.prototype.onAddUIEvent = function onAddUIEvent(uiEvent) {
    this._subscribe(uiEvent);
    return this;
};

/**
 * Appends an `ADD_EVENT_LISTENER` command to the command queue.
 *
 * @method
 * @private
 *
 * @param {String} UIEvent Event type (e.g. `click`)
 *
 * @return {undefined} undefined
 */
DOMElement.prototype._subscribe = function _subscribe (UIEvent) {
    if (this._initialized)
        this._changeQueue.push('SUBSCRIBE', UIEvent, true);
    if (!this._requestingUpdate)
        this._requestUpdate();
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
    if (this._initialized) {
        if (x === RENDER_SIZE || y === RENDER_SIZE || z === RENDER_SIZE) {
            this._renderSized = true;
            this._requestingRenderSize = true;
        }
        this.onSizeChange(this._node.getSize());
    }

    return this;
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
    return this.value.renderSize;
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
    if (!this._requestingUpdate && this._node) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }
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
    if (!this.value.classes[value] || this._inDraw) {
        this.value.classes[value] = true;
        if (this._initialized)
            this._changeQueue.push('ADD_CLASS', value);
        this._requestUpdate();
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
    if (this.value.classes[value] || this._inDraw) {
        this.value.classes[value] = true;
        if (this._initialized)
            this._changeQueue.push('REMOVE_CLASS', value);
        this._requestUpdate();
    }

    return this;
};

DOMElement.prototype.getClasses = function getClasses () {
    return Object.keys(this.value.classes);
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
    return !!this.value.classes[value];
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
    if (this.value.attributes[name] !== value || this._inDraw) {
        this.value.attributes[name] = value;
        if (this._initialized)
            this._changeQueue.push('CHANGE_ATTRIBUTE', name, value);
        this._requestUpdate();
    }

    return this;
};

DOMElement.prototype.getAttribute = function getAttribute (name) {
    return this.value.attributes[name];
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
    if (this.value.properties[name] !== value || this._inDraw) {
        this.value.properties[name] = value;
        if (this._initialized) this._changeQueue.push('CHANGE_PROPERTY', name, value);
        if (!this._requestingUpdate) this._requestUpdate();
        if (this._renderSized) this._requestingRenderSize = true;
    }

    return this;
};

DOMElement.prototype.getProperty = function getProperty (name) {
    return this.value.properties[name];
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
    if (this.value.content !== content || this._inDraw) {
        this.value.content = content;
        if (this._initialized) this._changeQueue.push('CHANGE_CONTENT', content);
        if (!this._requestingUpdate) this._requestUpdate();
        if (this._renderSized) this._requestingRenderSize = true;
    }

    return this;
};

DOMElement.prototype.getContent = function getContent () {
    return this.value.content;
};

/**
 * Subscribes to a DOMElement. TODO
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
    return this._callbackStore.on(event, listener);
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
        this.value.renderSize[0] = payload.val[0];
        this.value.renderSize[1] = payload.val[1];

        if (!this._requestingUpdate)
            this._requestUpdate();
    }
    this._callbackStore.trigger(event, payload);
};

module.exports = DOMElement;
