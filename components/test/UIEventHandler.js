'use strict';

var test = require('tape');
var UIEventHandler = require('../src/UIEventHandler');

test('UIEventHandler', function(t) {

    var onCalled = '';
    var registeredEvent = '';
    var deregisteredEvent = '';

    var ui = new UIEventHandler({
        getRenderables: function() {
            return [{
                on: function(ev) {
                    onCalled = ev;
                }
            }];
        },
        registerTargetedEvent: function(ev) {
            registeredEvent = ev;
        },
        deregisterGlobalEvent: function(ev) {
            deregisteredEvent = ev;
        }
    });

    t.test('toString static method', function(t) {
        t.equal(typeof UIEventHandler.toString, 'function', 'UIEventHandler.toString should be a function');
        t.equal(UIEventHandler.toString(), 'UIEventHandler');
        t.end();
    });

    var clicks = 0;
    var cb = function(p) {clicks += p;};

    t.test('on method', function(t) {
        t.equal(typeof ui.on, 'function', 'UIEventHandler#on should be a function');

        ui.on('click', cb);
        t.assert(registeredEvent === 'click', 'UIEventHandler#on should call .registerTargetedEvent on its dispatch');
        t.assert(onCalled === 'click', 'UIEventHandler#on should call .on on its dispatch\'s renderables');

        t.end();
    });

    t.test('trigger method', function(t) {
        t.equal(typeof ui.trigger, 'function', 'UIEventHandler#trigger should be a function');

        ui.trigger('click', 5);
        t.assert(clicks === 5, 'UIEventHandler#trigger should correctly pass a payload to the registered callback');

        t.end();
    });

    t.test('off method', function(t) {
        t.equal(typeof ui.off, 'function', 'UIEventHandler#off should be a function');

        ui.off('click', cb);
        t.assert(deregisteredEvent === 'click', 'UIEventHandler#off should call .deregisterGlobalEvent on its dispatch');

        ui.trigger('click', 3);
        t.assert(clicks === 5, 'UIEventHandler#off should stop associating the callback with the event');

        t.end();
    });
});
