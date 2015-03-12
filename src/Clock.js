'use strict';

function Clock () {
    this._updates = [];
    this._nextStepUpdates = [];
    this._time = null;
}

Clock.prototype.step = function step (time) {
    this._time = time;

    for (var i = 0, len = this._updates.length ; i < len ; i++)
        this._updates[i].update(time);

    while (this._nextStepUpdates.length > 0) {
        this._nextStepUpdates.shift().update(time);
    }

    return this;
};

Clock.prototype.update = function update (target) {
    this._updates.push(target);
    return this;
};

Clock.prototype.noLongerUpdate = function noLongerUpdate(target) {
    var index = this._updates.indexOf(target);
    if (index > -1)
        this._updates.splice(index, 1);
    return this;
};

Clock.prototype.getTime = function getTime () {
    return this._time;
};

Clock.prototype.nextStep = function nextStep (target) {
    this._nextStepUpdates.push(target);
    return this;
};

module.exports = Clock;
