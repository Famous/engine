'use strict';

var CallbackStore = require('famous-utilities').CallbackStore;

var ELEMENT = 'element';
var ID = 'id';
var WIDTH = 'width';
var HEIGHT = 'height';
var OPACITY = 'opacity';
var PX = 'px';
var WITH = 'WITH';
var CHANGE_TRANSFORM = 'CHANGE_TRANSFORM';
var CHANGE_TRANSFORM_ORIGIN = 'CHANGE_TRANSFORM_ORIGIN';
var CHANGE_PROPERTY = 'CHANGE_PROPERTY';
var CHANGE_TAG = 'CHANGE_TAG';
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
function HTMLElement(dispatch) {
    this._dispatch = dispatch;
    this._id = dispatch.addRenderable(this);
    this._trueSized = [false, false];
    this._size = [0, 0, 0];
    this._queue = [];
    this._callbacks = new CallbackStore();
    this._dispatch.onTransformChange(this._receiveTransformChange.bind(this));
    this._dispatch.onSizeChange(this._receiveSizeChange.bind(this));
    this._dispatch.onOpacityChange(this._receiveOpacityChange.bind(this));
    this._dispatch.onOriginChange(this._receiveOriginChange.bind(this));
    this._receiveTransformChange(this._dispatch.getContext()._transform);
    this._receiveOriginChange(this._dispatch.getContext()._origin);
}

// Return the name of the Element Class: 'element'
HTMLElement.toString = function toString() {
    return ELEMENT;
};

HTMLElement.prototype.clean = function clean() {
    var len = this._queue.length;
    if (len) {
    	var path = this._dispatch.getRenderPath();
    	this._dispatch.sendDrawCommand(WITH).sendDrawCommand(path);
    	for (var i = 0 ; i < len ; i++)
    	    this._dispatch.sendDrawCommand(this._queue.shift());
    }
    return true;
};

HTMLElement.prototype._receiveTransformChange = function _receiveTransformChange(transform) {
    this._dispatch.dirtyRenderable(this._id);
    var queue = this._queue;
    queue.push(CHANGE_TRANSFORM);
    queue.push(transform._matrix[0]);
    queue.push(transform._matrix[1]);
    queue.push(transform._matrix[2]);
    queue.push(transform._matrix[3]);
    queue.push(transform._matrix[4]);
    queue.push(transform._matrix[5]);
    queue.push(transform._matrix[6]);
    queue.push(transform._matrix[7]);
    queue.push(transform._matrix[8]);
    queue.push(transform._matrix[9]);
    queue.push(transform._matrix[10]);
    queue.push(transform._matrix[11]);
    queue.push(transform._matrix[12]);
    queue.push(transform._matrix[13]);
    queue.push(transform._matrix[14]);
    queue.push(transform._matrix[15]);
};

HTMLElement.prototype._receiveSizeChange = function _receiveSizeChange(size) {
    this._dispatch.dirtyRenderable(this._id);
    var width = this._trueSized[0] ? this._trueSized[0] : size._size[0];
    var height = this._trueSized[1] ? this._trueSize[1] : size._size[1];
    this._queue.push('CHANGE_SIZE');
    this._queue.push(width);
    this._queue.push(height);
    this._size[0] = width;
    this._size[1] = height;
};

HTMLElement.prototype._receiveOriginChange = function _receiveOriginChange(origin) {
    this._dispatch.dirtyRenderable(this._id);
    this._queue.push(CHANGE_TRANSFORM_ORIGIN);
    this._queue.push(origin.x);
    this._queue.push(origin.y);
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

HTMLElement.prototype.kill = function kill () {
    this._dispatch.sendDrawCommand(WITH).sendDrawCommand(this._dispatch.getRenderPath()).sendDrawCommand(RECALL);
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
    this._dispatch.dirtyRenderable(this._id);
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
        this._dispatch.dirtyRenderable(this._id);
    }
    this._trueSized[0] = trueWidth;
    this._trueSized[1] = trueHeight;
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
    this._dispatch.dirtyRenderable(this._id);
    this._queue.push(CHANGE_TAG);
    this._queue.push(value);
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
    this._dispatch.dirtyRenderable(this._id);
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
    this._dispatch.dirtyRenderable(this._id);
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
    this._dispatch.dirtyRenderable(this._id);
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
    this._dispatch.dirtyRenderable(this._id);
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
 * @param {String | DOM element | Document Fragment} value content to be inserted into the DOM element
 * @return {HTMLElement} current HTMLElement
 */
HTMLElement.prototype.content = function content(value) {
    this._dispatch.dirtyRenderable(this._id);
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
    this._dispatch.dirtyRenderable(this._id);
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
