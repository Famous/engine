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

var CompositionEvent = require('./CompositionEvent');
var Event = require('./Event');
var FocusEvent = require('./FocusEvent');
var InputEvent = require('./InputEvent');
var KeyboardEvent = require('./KeyboardEvent');
var MouseEvent = require('./MouseEvent');
var TouchEvent = require('./TouchEvent');
var UIEvent = require('./UIEvent');
var WheelEvent = require('./WheelEvent');

var compositionEvent = new CompositionEvent({});
var event = new Event({});
var focusEvent = new FocusEvent({});
var inputEvent = new InputEvent({});
var keyboardEvent = new KeyboardEvent({});
var mouseEvent = new MouseEvent({});
var touchEvent = new TouchEvent({});
var uiEvent = new UIEvent({});
var wheelEvent = new WheelEvent({});

var EventMap = {
    // UI Events (http://www.w3.org/TR/uievents/)
    'abort': [event, false],
    'beforeinput': [inputEvent, true],
    'blur': [focusEvent, false],
    'click': [mouseEvent, true],
    'compositionend': [compositionEvent, true],
    'compositionstart': [compositionEvent, true],
    'compositionupdate': [compositionEvent, true],
    'dblclick': [mouseEvent, true],
    'focus': [focusEvent, false],
    'focusin': [FocusEvent, true],
    'focusout': [FocusEvent, true],
    'input': [inputEvent, true],
    'keydown': [keyboardEvent, true],
    'keyup': [keyboardEvent, true],
    'load': [event, false],
    'mousedown': [mouseEvent, true],
    'mouseenter': [mouseEvent, false],
    'mouseleave': [mouseEvent, false],

    // bubbles, but will be triggered very frequently
    'mousemove': [mouseEvent, false],

    'mouseout': [mouseEvent, true],
    'mouseover': [mouseEvent, true],
    'mouseup': [mouseEvent, true],
    'resize': [uiEvent, false],

    // might bubble
    'scroll': [uiEvent, false],
    
    'select': [event, true],
    'unload': [event, false],
    'wheel': [wheelEvent, true],

    // Touch Events Extension (http://www.w3.org/TR/touch-events-extensions/)
    'touchcancel': [touchEvent, true],
    'touchend': [touchEvent, true],
    'touchmove': [touchEvent, true],
    'touchstart': [touchEvent, true],
};

module.exports = EventMap;
