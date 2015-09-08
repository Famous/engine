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

define([
    'famous/dom-renderers/events/CompositionEvent',
    'famous/dom-renderers/events/Event',
    'famous/dom-renderers/events/FocusEvent',
    'famous/dom-renderers/events/InputEvent',
    'famous/dom-renderers/events/KeyboardEvent',
    'famous/dom-renderers/events/MouseEvent',
    'famous/dom-renderers/events/TouchEvent',
    'famous/dom-renderers/events/UIEvent',
    'famous/dom-renderers/events/WheelEvent'
    ], function ( CompositionEvent, Event, FocusEvent, InputEvent, KeyboardEvent, MouseEvent, TouchEvent, UIEvent, WheelEvent ) {

/**
 * A mapping of DOM events to the corresponding handlers
 *
 * @name EventMap
 * @type Object
 */
var EventMap = {
    change                         : [Event, true],
    submit                         : [Event, true],

    // UI Events (http://www.w3.org/TR/uievents/)
    abort                          : [Event, false],
    beforeinput                    : [InputEvent, true],
    blur                           : [FocusEvent, false],
    click                          : [MouseEvent, true],
    compositionend                 : [CompositionEvent, true],
    compositionstart               : [CompositionEvent, true],
    compositionupdate              : [CompositionEvent, true],
    dblclick                       : [MouseEvent, true],
    focus                          : [FocusEvent, false],
    focusin                        : [FocusEvent, true],
    focusout                       : [FocusEvent, true],
    input                          : [InputEvent, true],
    keydown                        : [KeyboardEvent, true],
    keyup                          : [KeyboardEvent, true],
    load                           : [Event, false],
    mousedown                      : [MouseEvent, true],
    mouseenter                     : [MouseEvent, false],
    mouseleave                     : [MouseEvent, false],

    // bubbles, but will be triggered very frequently
    mousemove                      : [MouseEvent, false],

    mouseout                       : [MouseEvent, true],
    mouseover                      : [MouseEvent, true],
    mouseup                        : [MouseEvent, true],
    contextMenu                    : [MouseEvent, true],
    resize                         : [UIEvent, false],

    // might bubble
    scroll                         : [UIEvent, false],

    select                         : [Event, true],
    unload                         : [Event, false],
    wheel                          : [WheelEvent, true],

    // Touch Events Extension (http://www.w3.org/TR/touch-events-extensions/)
    touchcancel                    : [TouchEvent, true],
    touchend                       : [TouchEvent, true],
    touchmove                      : [TouchEvent, true],
    touchstart                     : [TouchEvent, true]
};

return EventMap;
});
