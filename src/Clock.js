'use strict';

function Clock () {
    this._updates = [];
    this._time = null;
}

Clock.prototype.step = function step (time) {
    this._time = time;

    for (var i = 0, len = this._updates.length ; i < len ; i++)
        this._updates[i].update(time);
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

module.exports = Clock;
