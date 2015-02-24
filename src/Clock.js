'use strict';

var Context = require('./Context');
var GlobalDispatch = require('./GlobalDispatch');

var FRAME = 'FRAME';

var WORKER = (typeof window === 'undefined');

function noop() {}

function Clock () {
    this.dispatch = new GlobalDispatch();
    this.roots = [];
    this.dispatch.targetedOn('engine', FRAME, this.step.bind(this));

    if (WORKER) {
        var _this = this;
        self.onmessage = function(ev) {
            _this.receiveCommands(ev.data);
        };
    }
}

Clock.prototype.step = function step (time) {
    for (var i = 0, len = this.roots.length ; i < len ; i++) {
        this.roots[i].update(time);
    }

    var events = this.dispatch.events;
    if (events.length) {
        if (WORKER) {
            self.postMessage(events);
        } else {
            this.oncommands(events);
        }
        this.dispatch.flush();
    }
};

Clock.prototype.oncommands = noop;

Clock.prototype.publish = function publish (instance, selector) {
    this.roots.push(new Context(instance, selector, this.dispatch));
    return this;
};

Clock.prototype.receiveCommands = function receiveCommands (commands) {
    this.dispatch.receiveCommands(commands);
    return this;
};

module.exports = Clock;
