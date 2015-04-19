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
    'abort': Event,
    'beforeinput': InputEvent,
    'blur': FocusEvent,
    'click': MouseEvent,
    'compositionend': CompositionEvent,
    'compositionstart': CompositionEvent,
    'compositionupdate': CompositionEvent,
    'dblclick': MouseEvent,
    'focus': FocusEvent,
    'focusin': FocusEvent,
    'focusout': FocusEvent,
    'input': InputEvent,
    'keydown': KeyboardEvent,
    'keyup': KeyboardEvent,
    'load': Event,
    'mousedown': MouseEvent,
    'mouseleave': MouseEvent,
    'mousemove': MouseEvent,
    'mouseout': MouseEvent,
    'mouseover': MouseEvent,
    'mouseup': MouseEvent,
    'resize': UIEvent,
    'scroll': UIEvent,
    'select': Event,
    'touchcancel': TouchEvent,
    'touchend': TouchEvent,
    'touchmove': TouchEvent,
    'touchstart': TouchEvent,
    'unload': Event,
    'wheel': WheelEvent
};

module.exports = EventMap;
