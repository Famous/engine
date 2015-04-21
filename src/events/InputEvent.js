'use strict';

var UIEvent = require('./UIEvent');

function InputEvent(ev) {
    // [Constructor(DOMString typeArg, optional InputEventInit inputEventInitDict)]
    // interface InputEvent : UIEvent {
    //     readonly    attribute DOMString inputType;
    //     readonly    attribute DOMString data;
    //     readonly    attribute boolean   isComposing;
    //     readonly    attribute Range     targetRange;
    // };

    UIEvent.call(this, ev);
    this.inputType = ev.inputType;
    this.data = ev.data;
    this.isComposing = ev.isComposing;
    this.targetRange = ev.targetRange;
}

InputEvent.prototype = UIEvent.prototype;
InputEvent.prototype.constructor = InputEvent;

module.exports = InputEvent;
