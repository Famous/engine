'use strict';

var Event = require('./Event');

function UIEvent(ev) {
    // [Constructor(DOMString type, optional UIEventInit eventInitDict)]
    // interface UIEvent : Event {
    //     readonly    attribute Window? view;
    //     readonly    attribute long    detail;
    // };

    Event.call(this, ev);
    this.detail = ev.detail;
}

module.exports = UIEvent;
