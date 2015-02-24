'use strict';

var CallbackStore = require('famous-utilities').CallbackStore;

var ELEMENT = 'element';
var ID = 'id';
var WIDTH = 'width';
var HEIGHT = 'height';
var OPACITY = 'opacity';
var PX = 'px';
var TRANSFORM = 'transform';

var WITH = 'WITH';
var CHANGE_TRANSFORM_ORIGIN = 'CHANGE_TRANSFORM_ORIGIN';
var CHANGE_PROPERTY = 'CHANGE_PROPERTY';
var CHANGE_TAG = 'CHANGE_TAG';
var CHANGE_ATTRIBUTE = 'CHANGE_ATTRIBUTE';
var ADD_CLASS = 'ADD_CLASS';
var CHANGE_ATTRIBUTE = 'CHANGE_ATTRIBUTE';
var CHANGE_CONTENT = 'CHANGE_CONTENT';
var ADD_EVENT_LISTENER = 'ADD_EVENT_LISTENER';
var EVENT_METHODS = 'EVENT_METHODS';
var EVENT_PROPERTIES = 'EVENT_PROPERTIES';
var EVENT_END = 'EVENT_END';

/**
 * The Element class is responsible for providing the API for how
 *   a RenderNode will interact with the DOM API's.  The element is
 *   responsible for adding a set of commands to the renderer.
 *
 * @class Element
 * @constructor
 * @component
 * @param {RenderNode} RenderNode to which the instance of Element will be a component of
 */
function HTMLElement(dispatch) {
    this.dispatch = dispatch;
    this._id = dispatch.addRenderable(this);
    this._trueSized = false;
    this._size = [0, 0, 0];
    this.queue = [];
    this.callbacks = new CallbackStore();
    this.init();
}

// Return the name of the Element Class: 'element'
HTMLElement.toString = function toString() {
    return ELEMENT;
};

HTMLElement.prototype.init = function init() {
    var dispatch = this.dispatch;
    dispatch.onTransformChange(this._receiveTransformChange.bind(this));
    dispatch.onSizeChange(this._receiveSizeChange.bind(this));
    dispatch.onOpacityChange(this._receiveOpacityChange.bind(this));
    dispatch.onOriginChange(this._receiveOriginChange.bind(this));
    this._receiveTransformChange(dispatch.getContext()._transform);
    this._receiveOriginChange(dispatch.getContext()._origin);
    return this;
}
HTMLElement.prototype.clean = function clean() {
    var len = this.queue.length;
    if (len) {
    	var path = this.dispatch.getRenderPath();
    	this.dispatch.sendDrawCommand(WITH).sendDrawCommand(path);
    	for (var i = 0 ; i < len ; i++) {
    	    this.dispatch.sendDrawCommand(this.queue.shift());
        }
    }
    return !this.queue.length;
};

HTMLElement.prototype._receiveTransformChange = function _receiveTransformChange(transform) {
    this.property(TRANSFORM, transform._matrix);
};

HTMLElement.prototype._receiveSizeChange = function _receiveSizeChange(size) {
    if (!this.trueSized) {
    	var size = size.getTopDownSize();
    	this.property(WIDTH, Math.round(size[0]) + PX)
    	    .property(HEIGHT, Math.round(size[1]) + PX);
    	this._size[0] = size[0];
    	this._size[1] = size[1];
    }
};

HTMLElement.prototype._receiveOriginChange = function _receiveOriginChange(origin) {
    this.dispatch.dirtyRenderable(this._id);
    this.queue.push(CHANGE_TRANSFORM_ORIGIN);
    this.queue.push(origin.x);
    this.queue.push(origin.y);
};

HTMLElement.prototype._receiveOpacityChange = function _receiveOpacityChange(opacity) {
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
    this.dispatch.dirtyRenderable(this._id);
    this.queue.push(CHANGE_PROPERTY);
    this.queue.push(key);
    this.queue.push(value);
    return this;
};

/**
 * The method by which a user tells the element to ignore the context
 *   size and get size from the content instead.
 *
 * @method trueSize
 * @chainable
 *
 * @return {HTMLElement} this
 */
HTMLElement.prototype.trueSize = function trueSize() {
    if (!this.trueSized) {
	this.trueSized = true;
	this.dispatch.dirtyRenderable(this._id);
    }
    return this;
};

/**
 * Set the tag name of the element
 *
 * @method tagName
 * @chainable
 *
 * @param {String} value type of HTML tag
 * @return {HTMLElement} current HTMLElement
 */
HTMLElement.prototype.tagName = function tagName(value) {
    this.dispatch.dirtyRenderable(this._id);
    this.queue.push(CHANGE_TAG);
    this.queue.push(value);
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
    this.dispatch.dirtyRenderable(this._id);
    this.queue.push(CHANGE_ATTRIBUTE);
    this.queue.push(key);
    this.queue.push(value);
    return this;
};

/**
 * Define a CSS class to be on the DOM element
 *
 * @method cssClass
 * @chainable
 *
 * @param {String} value name of the class
 * @return {HTMLElement} current HTMLElement
 */
HTMLElement.prototype.cssClass = function cssClass(value) {
    this.dispatch.dirtyRenderable(this._id);
    this.queue.push(ADD_CLASS);
    this.queue.push(value);
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
    this.dispatch.dirtyRenderable(this._id);
    this.queue.push(CHANGE_ATTRIBUTE);
    this.queue.push(ID);
    this.queue.push(value);
    return this;
};

/**
 * Define the content of the DOM element
 *
 * @method content
 * @chainable
 *
 * @param {String | DOM element | Document Fragment} value content to be inserted into the DOM element
 * @return {HTMLElement} current HTMLElement
 */
HTMLElement.prototype.content = function content(value) {
    this.dispatch.dirtyRenderable(this._id);
    this.queue.push(CHANGE_CONTENT);
    this.queue.push(value);
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
    this.dispatch.dirtyRenderable(this._id);
    this.queue.push(ADD_EVENT_LISTENER);
    this.queue.push(ev);
    this.queue.push(EVENT_METHODS);
    if (methods != null) {
        for(var i = 0, len = methods.length; i < len; i++) {
            this.queue.push(methods[i]);
        }
    }
    this.queue.push(EVENT_PROPERTIES);
    if (properties != null) {
        for(var i = 0, len = properties.length; i < len; i++) {
            this.queue.push(properties[i]);
        }
    }
    this.queue.push(EVENT_END);
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
    return !!this.queue.length;
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
    var queueLength = this.queue.length;
    var i = 0;

    this.target = null;
    this.trueSized = false;

    for (; i < queueLength; i++) {
	this.queue.pop();
    }

    return this;
};

module.exports = HTMLElement;
