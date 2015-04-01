'use strict';

var CallbackStore = require('famous-utilities').CallbackStore;

var ELEMENT = 'element';
var ID = 'id';
var OPACITY = 'opacity';
var WITH = 'WITH';
var CHANGE_TRANSFORM = 'CHANGE_TRANSFORM';
var CHANGE_PROPERTY = 'CHANGE_PROPERTY';
var INIT_DOM = 'INIT_DOM';
var CHANGE_ATTRIBUTE = 'CHANGE_ATTRIBUTE';
var ADD_CLASS = 'ADD_CLASS';
var REMOVE_CLASS = 'REMOVE_CLASS';
var CHANGE_ATTRIBUTE = 'CHANGE_ATTRIBUTE';
var CHANGE_CONTENT = 'CHANGE_CONTENT';
var ADD_EVENT_LISTENER = 'ADD_EVENT_LISTENER';
var EVENT_PROPERTIES = 'EVENT_PROPERTIES';
var EVENT_END = 'EVENT_END';
var RECALL = 'RECALL';

/**
 * The Element class is responsible for providing the API for how
 *   a RenderNode will interact with the DOM API's.  The element is
 *   responsible for adding a set of commands to the renderer.
 *
 * @class HTMLElement
 * @constructor
 * @component
 * @param {RenderNode} RenderNode to which the instance of Element will be a component of
 */
function HTMLElement(node, tagName) {
    this._trueSized = [false, false];
    this._size = [0, 0, 0];
    this._queue = [];
    this._tagName = tagName ? tagName : 'div';

    this._requestingUpdate = false;

    this._node = node;
    this._id = node.addComponent(this);
    this.init(node) // TODO: this is not ideal 
    this._callbacks = new CallbackStore();
}

// Return the name of the Element Class: 'element'
HTMLElement.toString = function toString() {
    return ELEMENT;
};

HTMLElement.prototype._requestUpdate = function _requestUpdate () {
    if (!this._requestingUpdate) {
        this._requestingUpdate = true;
        this._node.requestUpdate(this._id);
    }
};

HTMLElement.prototype.init = function init (node) {
    this._queue.push(INIT_DOM);
    this._queue.push(this._tagName);
    this.onTransformChange(node.getTransform());
    this.onSizeChange(node.getSize());
};

// HTMLElement.prototype.onMount = function onMount (node) {
//    this.init(node);
// };

HTMLElement.prototype.onUpdate = function onUpdate () {
    var len = this._queue.length;
    if (len) {
        var path = this._node.getLocation();
    	this._node //node.sendDrawCommand will be depricated.
            .sendDrawCommand(WITH)
            .sendDrawCommand(path)
            .sendDrawCommand('DOM');

    	for (var i = 0 ; i < len ; i++) // node.sendDrawCommand will be depricated.
    	    this._node.sendDrawCommand(this._queue.shift());
    }

    this._requestingUpdate = false;
};

HTMLElement.prototype.onTransformChange = function onTransformChange(transform) {
    if (!this._requestingUpdate) this._requestUpdate();
    var queue = this._queue;
    queue.push(CHANGE_TRANSFORM);
    queue.push(transform[0]);
    queue.push(transform[1]);
    queue.push(transform[2]);
    queue.push(transform[3]);
    queue.push(transform[4]);
    queue.push(transform[5]);
    queue.push(transform[6]);
    queue.push(transform[7]);
    queue.push(transform[8]);
    queue.push(transform[9]);
    queue.push(transform[10]);
    queue.push(transform[11]);
    queue.push(transform[12]);
    queue.push(transform[13]);
    queue.push(transform[14]);
    queue.push(transform[15]);
};

HTMLElement.prototype.onSizeChange = function onSizeChange(size) {
    if (!this._requestingUpdate) this._requestUpdate();
    var width = this._trueSized[0] ? this._trueSized[0] : size[0];
    var height = this._trueSized[1] ? this._trueSized[1] : size[1];
    this._queue.push('CHANGE_SIZE');
    this._queue.push(width);
    this._queue.push(height);
    this._size[0] = width;
    this._size[1] = height;
};

HTMLElement.prototype.onOpacityChange = function onOpacityChange(opacity) {
    this.property(OPACITY, opacity.value);
};

HTMLElement.prototype.getSize = function getSize() {
    return this._size;
};

HTMLElement.prototype.on = function on (ev, methods, properties) {
    this.eventListener(ev, methods, properties);
    return this;
};

/**
 * Set the value of a CSS property
 *
 * @method property
 * @chainable
 *
 * @param {String} key name of the property to set
 * @param {Any} value associated value for this property
 * @return {HTMLElement} current HTMLElement
 */
HTMLElement.prototype.property = function property(key, value) {
    if (!this._requestingUpdate) this._requestUpdate();
    this._queue.push(CHANGE_PROPERTY);
    this._queue.push(key);
    this._queue.push(value);
    return this;
};

/**
 * The method by which a user tells the element to ignore the context
 *   size and get size from the content instead.
 *
 * @method trueSize
 * @chainable
 *
 * @param {Boolean} trueWidth
 * @param {Boolean} trueHeight
 * @return {HTMLElement} this
 */
HTMLElement.prototype.trueSize = function trueSize(trueWidth, trueHeight) {
    if (trueWidth === undefined) trueWidth = true;
    if (trueHeight === undefined) trueHeight = true;

    if (this._trueSized[0] !== trueWidth || this._trueSized[1] !== trueHeight) {
        if (!this._requestingUpdate) this._requestUpdate();
    }
    this._trueSized[0] = trueWidth;
    this._trueSized[1] = trueHeight;
    return this;
};

/**
 * Set an attribute on the DOM element
 *
 * @method attribute
 * @chainable
 *
 * @param {String} key name of the attribute to set
 * @param {Any} value associated value for this attribute
 * @return {HTMLElement} current HTMLElement
 */
HTMLElement.prototype.attribute = function attribute(key, value) {
    if (!this._requestingUpdate) this._requestUpdate();
    this._queue.push(CHANGE_ATTRIBUTE);
    this._queue.push(key);
    this._queue.push(value);
    return this;
};

/**
 * Define a CSS class to be added to the DOM element
 *
 * @method addClass
 * @chainable
 *
 * @param {String} value name of the class
 * @return {HTMLElement} current HTMLElement
 */
HTMLElement.prototype.addClass = function addClass(value) {
    if (!this._requestingUpdate) this._requestUpdate();
    this._queue.push(ADD_CLASS);
    this._queue.push(value);
    return this;
};
/**
 * Define a CSS class to be removed from the DOM element
 *
 * @method removeClass
 * @chainable
 *
 * @param {String} value name of the class
 * @return {HTMLElement} current HTMLElement
 */
HTMLElement.prototype.removeClass = function removeClass(value) {
    if (!this._requestingUpdate) this._requestUpdate();
    this._queue.push(REMOVE_CLASS);
    this._queue.push(value);
    return this;
};

/**
 * Define the id of the DOM element
 *
 * @method id
 * @chainable
 *
 * @param {String} value id
 * @return {HTMLElement} current HTMLElement
 */
HTMLElement.prototype.id = function id(value) {
    if (!this._requestingUpdate) this._requestUpdate();
    this._queue.push(CHANGE_ATTRIBUTE);
    this._queue.push(ID);
    this._queue.push(value);
    return this;
};

/**
 * Define the content of the DOM element
 *
 * @method content
 * @chainable
 *
 * @param {String|DOMElement|DocumentFragment} value content to be inserted into the DOM element
 * @return {HTMLElement} current HTMLElement
 */
HTMLElement.prototype.content = function content(value) {
    if (!this._requestingUpdate) this._requestUpdate();
    this._queue.push(CHANGE_CONTENT);
    this._queue.push(value);
    return this;
};

/**
 * Get a component of the RenderNode that the HTMLElement component is
 *   attached to by name.
 *
 * @method get
 *
 * @param {String} key name of the component to grab from the RenderNode
 * @return {Component} a component that exists on the RenderNode
 */
HTMLElement.prototype.get = function get (key) {
    return this.owner.get(key);
};

/**
 * Adds a command to add an eventListener to the current DOM HTMLElement.
 *   primarily used internally.
 *
 * @method eventListener
 * @chainable
 *
 * @param {String} ev the name of the DOM event to be targeted
 *
 * @return {Component} this
 */
HTMLElement.prototype.eventListener = function eventListener (ev, methods, properties) {
    if (!this._requestingUpdate) this._requestUpdate();
    this._queue.push(ADD_EVENT_LISTENER);
    this._queue.push(ev);
    if (methods != null) this._queue.push(methods);
    this._queue.push(EVENT_PROPERTIES);
    if (properties != null) this._queue.push(properties);
    this._queue.push(EVENT_END);
    return this;
};

/**
 * isRenderable returns whether or not this HTMLElement currently has any Information to render
 *
 * @method isRenderable
 *
 * @return {Bool} whether or not this HTMLElement can be rendered
 */
HTMLElement.prototype.isRenderable = function isRenderable () {
    return !!this._queue.length;
};

/**
 * Clears the state on the HTMLElement so that it can be rendered next frame.
 *
 * @method clear
 * @chainable
 *
 * @return {HTMLElement} this
 */
HTMLElement.prototype.clear = function clear () {
    this._trueSized[0] = false;
    this._trueSized[1] = false;

    for (var i = 0, l = this._queue.length; i < l; i++)
        this._queue.pop();

    return this;
};

module.exports = HTMLElement;
