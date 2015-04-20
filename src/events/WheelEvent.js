'use strict';

var MouseEvent = require('./MouseEvent');

function WheelEvent(ev) {
    // [Constructor(DOMString typeArg, optional WheelEventInit wheelEventInitDict)]
    // interface WheelEvent : MouseEvent {
    //     // DeltaModeCode
    //     const unsigned long DOM_DELTA_PIXEL = 0x00;
    //     const unsigned long DOM_DELTA_LINE = 0x01;
    //     const unsigned long DOM_DELTA_PAGE = 0x02;
    //     readonly    attribute double        deltaX;
    //     readonly    attribute double        deltaY;
    //     readonly    attribute double        deltaZ;
    //     readonly    attribute unsigned long deltaMode;
    // };

    MouseEvent.call(this, ev);
    this.DOM_DELTA_PIXEL = 0x00;
    this.DOM_DELTA_LINE = 0x01;
    this.DOM_DELTA_PAGE = 0x02;
    this.deltaX = ev.deltaX;
    this.deltaY = ev.deltaY;
    this.deltaZ = ev.deltaZ;
    this.deltaMode = ev.deltaMode;
}

WheelEvent.prototype = MouseEvent.prototype;
WheelEvent.prototype.constructor = WheelEvent;

module.exports = WheelEvent;
