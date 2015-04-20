'use strict';

var UIEvent = require('./UIEvent');

function CompositionEvent(ev) {
    // [Constructor(DOMString typeArg, optional CompositionEventInit compositionEventInitDict)]
    // interface CompositionEvent : UIEvent {
    //     readonly    attribute DOMString data;
    // };

    UIEvent.call(this, ev);
    this.data = ev.data;
}

CompositionEvent.prototype = UIEvent.prototype;
CompositionEvent.prototype.constructor = CompositionEvent;

module.exports = CompositionEvent;
