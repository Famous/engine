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

/**
 * See [UI Events (formerly DOM Level 3 Events)](http://www.w3.org/TR/2015/WD-uievents-20150428/#events-mouseevents).
 *
 * @class KeyboardEvent
 * @augments UIEvent
 *
 * @param {Event} ev The native DOM event.
 */
function MouseEvent(ev) {
    // [Constructor(DOMString typeArg, optional MouseEventInit mouseEventInitDict)]
    // interface MouseEvent : UIEvent {
    //     readonly    attribute long           screenX;
    //     readonly    attribute long           screenY;
    //     readonly    attribute long           clientX;
    //     readonly    attribute long           clientY;
    //     readonly    attribute boolean        ctrlKey;
    //     readonly    attribute boolean        shiftKey;
    //     readonly    attribute boolean        altKey;
    //     readonly    attribute boolean        metaKey;
    //     readonly    attribute short          button;
    //     readonly    attribute EventTarget?   relatedTarget;
    //     // Introduced in this specification
    //     readonly    attribute unsigned short buttons;
    //     boolean getModifierState (DOMString keyArg);
    // };

    UIEvent.call(this, ev);

    /**
     * @name MouseEvent#screenX
     * @type Number
     */
    this.screenX = ev.screenX;

    /**
     * @name MouseEvent#screenY
     * @type Number
     */
    this.screenY = ev.screenY;

    /**
     * @name MouseEvent#clientX
     * @type Number
     */
    this.clientX = ev.clientX;

    /**
     * @name MouseEvent#clientY
     * @type Number
     */
    this.clientY = ev.clientY;

    /**
     * @name MouseEvent#ctrlKey
     * @type Boolean
     */
    this.ctrlKey = ev.ctrlKey;

    /**
     * @name MouseEvent#shiftKey
     * @type Boolean
     */
    this.shiftKey = ev.shiftKey;

    /**
     * @name MouseEvent#altKey
     * @type Boolean
     */
    this.altKey = ev.altKey;

    /**
     * @name MouseEvent#metaKey
     * @type Boolean
     */
    this.metaKey = ev.metaKey;

    /**
     * @type MouseEvent#button
     * @type Number
     */
    this.button = ev.button;

    /**
     * @type MouseEvent#buttons
     * @type Number
     */
    this.buttons = ev.buttons;

    /**
     * @type MouseEvent#pageX
     * @type Number
     */
    this.pageX = ev.pageX;

    /**
     * @type MouseEvent#pageY
     * @type Number
     */
    this.pageY = ev.pageY;

    /**
     * @type MouseEvent#x
     * @type Number
     */
    this.x = ev.x;

    /**
     * @type MouseEvent#y
     * @type Number
     */
    this.y = ev.y;

    /**
     * @type MouseEvent#offsetX
     * @type Number
     */
    this.offsetX = ev.offsetX;

    /**
     * @type MouseEvent#offsetY
     * @type Number
     */
    this.offsetY = ev.offsetY;
}

MouseEvent.prototype = Object.create(UIEvent.prototype);
MouseEvent.prototype.constructor = MouseEvent;

/**
 * Return the name of the event type
 *
 * @method
 *
 * @return {String} Name of the event type
 */
MouseEvent.prototype.toString = function toString () {
    return 'MouseEvent';
};

module.exports = MouseEvent;
