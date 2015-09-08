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
    'famous/dom-renderers/events/EventMap',
    'famous/dom-renderers/events/FocusEvent',
    'famous/dom-renderers/events/InputEvent',
    'famous/dom-renderers/events/KeyboardEvent',
    'famous/dom-renderers/events/MouseEvent',
    'famous/dom-renderers/events/TouchEvent',
    'famous/dom-renderers/events/UIEvent',
    'famous/dom-renderers/events/WheelEvent'
    ], function ( CompositionEvent, Event, EventMap, FocusEvent, InputEvent, KeyboardEvent, MouseEvent, TouchEvent, UIEvent, WheelEvent ) {
return {
    CompositionEvent: CompositionEvent,
    Event: Event,
    EventMap: EventMap,
    FocusEvent: FocusEvent,
    InputEvent: InputEvent,
    KeyboardEvent: KeyboardEvent,
    MouseEvent: MouseEvent,
    TouchEvent: TouchEvent,
    UIEvent: UIEvent,
    WheelEvent: WheelEvent
};
});
