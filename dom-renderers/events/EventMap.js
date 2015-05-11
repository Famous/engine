'use strict';

var CompositionEvent = require('./CompositionEvent');
var Event = require('./Event');
var FocusEvent = require('./FocusEvent');
var InputEvent = require('./InputEvent');
var KeyboardEvent = require('./KeyboardEvent');
var MouseEvent = require('./MouseEvent');
var TouchEvent = require('./TouchEvent');
var UIEvent = require('./UIEvent');
var WheelEvent = require('./WheelEvent');

var EventMap = {
    // UI Events (http://www.w3.org/TR/uievents/)
    'abort': [Event, false],
    'beforeinput': [InputEvent, true],
    'blur': [FocusEvent, false],
    'click': [MouseEvent, true],
    'compositionend': [CompositionEvent, true],
    'compositionstart': [CompositionEvent, true],
    'compositionupdate': [CompositionEvent, true],
    'dblclick': [MouseEvent, true],
    'focus': [FocusEvent, false],
    'focusin': [FocusEvent, true],
    'focusout': [FocusEvent, true],
    'input': [InputEvent, true],
    'keydown': [KeyboardEvent, true],
    'keyup': [KeyboardEvent, true],
    'load': [Event, false],
    'mousedown': [MouseEvent, true],
    'mouseenter': [MouseEvent, false],
    'mouseleave': [MouseEvent, false],

    // bubbles, but will be triggered very frequently
    'mousemove': [MouseEvent, false],

    'mouseout': [MouseEvent, true],
    'mouseover': [MouseEvent, true],
    'mouseup': [MouseEvent, true],
    'resize': [UIEvent, false],

    // might bubble
    'scroll': [UIEvent, false],
    
    'select': [Event, true],
    'unload': [Event, false],
    'wheel': [WheelEvent, true],

    // Touch Events Extension (http://www.w3.org/TR/touch-events-extensions/)
    'touchcancel': [TouchEvent, true],
    'touchend': [TouchEvent, true],
    'touchmove': [TouchEvent, true],
    'touchstart': [TouchEvent, true],
};

module.exports = EventMap;
