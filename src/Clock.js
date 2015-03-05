'use strict';

var GlobalDispatch = require('./GlobalDispatch');

function Clock () {
    this._globalDispatch = new GlobalDispatch();
    this._updates = [];
    var _this = this;
    this._globalDispatch.targetedOn('engine', 'FRAME', function (time) {
        _this.step(time);
    });
    this._time = null;
}

Clock.prototype.step = function step (time) {
    this._time = time;

    for (var i = 0, len = this._updates.length ; i < len ; i++)
        this._updates[i].update(time);

    this._globalDispatch.flush();
};

Clock.prototype.update = function update (target) {
    this._updates.push(target);
    return this;
};

Clock.prototype.noLongerUpdate = function noLongerUpdate(target) {
    var index = this._updates.indexOf(target);
    if (index > -1) {
        this._updates.splice(index, 1);
    }
    return this;
};

Clock.prototype.getTime = function getTime () {
    return this._time;
};

Clock.prototype.receiveCommands = function receiveCommands (commands) {
    this._globalDispatch.receiveCommands(commands);
    return this;
};

Clock.prototype.getGlobalDispatch = function getGlobalDispatch () {
    return this._globalDispatch;
};

module.exports = new Clock();
