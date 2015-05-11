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

var DOMElement = require('./DOMElement');
var CallbackStore = require('../utilities/CallbackStore');

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
    console.warn("HTMLElement was depricated\n use DOMElement");
    return new DOMElement(node, tagName);
} 

module.exports = HTMLElement;
