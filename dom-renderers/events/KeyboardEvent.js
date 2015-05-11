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

KeyboardEvent.prototype = UIEvent.prototype;
KeyboardEvent.prototype.constructor = KeyboardEvent;

module.exports = KeyboardEvent;
