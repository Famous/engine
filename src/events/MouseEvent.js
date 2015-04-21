'use strict';

var UIEvent = require('./UIEvent');

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
    this.screenX = ev.screenX;
    this.screenX = ev.screenX;
    this.screenY = ev.screenY;
    this.clientX = ev.clientX;
    this.clientY = ev.clientY;
    this.ctrlKey = ev.ctrlKey;
    this.shiftKey = ev.shiftKey;
    this.altKey = ev.altKey;
    this.metaKey = ev.metaKey;
    this.button = ev.button;
    this.buttons = ev.buttons;
}

MouseEvent.prototype = UIEvent.prototype;
MouseEvent.prototype.constructor = MouseEvent;

module.exports = MouseEvent;
