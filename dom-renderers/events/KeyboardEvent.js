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

var UIEvent = require('./UIEvent');

function KeyboardEvent(ev) {
    // [Constructor(DOMString typeArg, optional KeyboardEventInit keyboardEventInitDict)]
    // interface KeyboardEvent : UIEvent {
    //     // KeyLocationCode
    //     const unsigned long DOM_KEY_LOCATION_STANDARD = 0x00;
    //     const unsigned long DOM_KEY_LOCATION_LEFT = 0x01;
    //     const unsigned long DOM_KEY_LOCATION_RIGHT = 0x02;
    //     const unsigned long DOM_KEY_LOCATION_NUMPAD = 0x03;
    //     readonly    attribute DOMString     key;
    //     readonly    attribute DOMString     code;
    //     readonly    attribute unsigned long location;
    //     readonly    attribute boolean       ctrlKey;
    //     readonly    attribute boolean       shiftKey;
    //     readonly    attribute boolean       altKey;
    //     readonly    attribute boolean       metaKey;
    //     readonly    attribute boolean       repeat;
    //     readonly    attribute boolean       isComposing;
    //     boolean getModifierState (DOMString keyArg);
    // };
    
    UIEvent.call(this, ev);
    this.DOM_KEY_LOCATION_STANDARD = 0x00;
    this.DOM_KEY_LOCATION_LEFT = 0x01;
    this.DOM_KEY_LOCATION_RIGHT = 0x02;
    this.DOM_KEY_LOCATION_NUMPAD = 0x03;
    this.key = ev.key;
    this.code = ev.code;
    this.location = ev.location;
    this.ctrlKey = ev.ctrlKey;
    this.shiftKey = ev.shiftKey;
    this.altKey = ev.altKey;
    this.metaKey = ev.metaKey;
    this.repeat = ev.repeat;
    this.isComposing = ev.isComposing;
    this.keyArg = ev.keyArg;
}

KeyboardEvent.prototype = Object.create(UIEvent.prototype);
KeyboardEvent.prototype.constructor = KeyboardEvent;

KeyboardEvent.prototype.toString = function toString () {
    return 'KeyboardEvent';
};

module.exports = KeyboardEvent;
