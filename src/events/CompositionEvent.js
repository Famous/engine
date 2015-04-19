'use strict';

var UIEvent = require('./UIEvent');

function CompositionEvent(ev) {
    // [Constructor(DOMString typeArg, optional CompositionEventInit compositionEventInitDict)]
    // interface CompositionEvent : UIEvent {
    //     readonly    attribute DOMString data;
    // };

    UIEvent.call(this);
    this.data = ev.data;
}

module.exports = CompositionEvent;
