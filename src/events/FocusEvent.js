'use strict';

var UIEvent = require('./UIEvent');

function FocusEvent(ev) {
    // [Constructor(DOMString typeArg, optional FocusEventInit focusEventInitDict)]
    // interface FocusEvent : UIEvent {
    //     readonly    attribute EventTarget? relatedTarget;
    // };

    UIEvent.call(this, ev);
}

FocusEvent.prototype = UIEvent.prototype;
FocusEvent.prototype.constructor = FocusEvent;

module.exports = FocusEvent;
