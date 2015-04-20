'use strict';

var UIEvent = require('./UIEvent');

function Touch(touch) {
    // interface Touch {
    //     readonly    attribute long        identifier;
    //     readonly    attribute EventTarget target;
    //     readonly    attribute double      screenX;
    //     readonly    attribute double      screenY;
    //     readonly    attribute double      clientX;
    //     readonly    attribute double      clientY;
    //     readonly    attribute double      pageX;
    //     readonly    attribute double      pageY;
    // };
    
    this.identifier = touch.identifier;
    this.target = touch.target;
    this.screenX = touch.screenX;
    this.screenY = touch.screenY;
    this.clientX = touch.clientX;
    this.clientY = touch.clientY;
    this.pageX = touch.pageX;
    this.pageY = touch.pageY;
}

function cloneTouchList(touchList) {
    // interface TouchList {
    //     readonly    attribute unsigned long length;
    //     getter Touch? item (unsigned long index);
    // };
    
    var touchListArray = [];
    for (var i = 0; i < touchList.length; i++) {
        touchListArray[i] = new Touch(touchList[i]);
    }
    return touchListArray;
}

function TouchEvent(ev) {
    // interface TouchEvent : UIEvent {
    //     readonly    attribute TouchList touches;
    //     readonly    attribute TouchList targetTouches;
    //     readonly    attribute TouchList changedTouches;
    //     readonly    attribute boolean   altKey;
    //     readonly    attribute boolean   metaKey;
    //     readonly    attribute boolean   ctrlKey;
    //     readonly    attribute boolean   shiftKey;
    // };

    UIEvent.call(this, ev);
    this.touches = cloneTouchList(ev.touches);
    this.targetTouches = cloneTouchList(ev.targetTouches);
    this.changedTouches = cloneTouchList(ev.changedTouches);
    this.altKey = ev.altKey;
    this.metaKey = ev.metaKey;
    this.ctrlKey = ev.ctrlKey;
    this.shiftKey = ev.shiftKey;
}


TouchEvent.prototype = UIEvent.prototype;
TouchEvent.prototype.constructor = TouchEvent;

module.exports = TouchEvent;
