'use strict';

function Engine () {
    this.updates = [];
    this.looper = this.loop.bind(this);
    this.looper();
}

Engine.prototype.step = function step (time) {
    for (var i = 0, len = this.updates.length ; i < len ; i++) {
        this.updates[i].update(time);
    }
};

Engine.prototype.loop = function loop (time) {
    this.step(time);
    requestAnimationFrame(this.looper);
};

Engine.prototype.update = function update (item) {
    this.updates.push(item);
    return this;
};

Engine.prototype.noLongerUpdate = function noLongerUpdate (item) {
    this.updates.splice(this.updates.indexOf(item), 1);
    return this;
};

module.exports = Engine;
