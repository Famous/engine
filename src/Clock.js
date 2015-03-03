'use strict';

var GlobalDispatch = require('./GlobalDispatch');

var FRAME = 'FRAME';

function noop() {}

function Clock () {
    this.dispatch = new GlobalDispatch();
    this.roots = [];
    this.dispatch.targetedOn('engine', FRAME, this.step.bind(this));
}

Clock.prototype.step = function step (time) {
    this.time = time;

    for (var i = 0, len = this.roots.length ; i < len ; i++)
        this.roots[i].update(time);

    this.dispatch.flush();
};

Clock.prototype.update = function update (target) {
    this.roots.push(target);
    return this;
};

Clock.prototype.getTime = function getTime () {
    return this.time;
};

Clock.prototype.receiveCommands = function receiveCommands (commands) {
    this.dispatch.receiveCommands(commands);
    return this;
};

module.exports = new Clock();
