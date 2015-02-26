'use strict';

var polyfills = require('famous-polyfills');
var rAF = polyfills.requestAnimationFrame;

function Engine() {
    this._updates = [];
    var _this = this;
    this.looper = function(time) {
        _this.loop(time);
    };
    this._looper = this.loop.bind(this);
    this.start();
}

Engine.prototype.start = function start() {
    this._running = true;
    this._looper();
    return this;
};

Engine.prototype.stop = function stop() {
    this._running = false;
    return this;
};

Engine.prototype.isRunning = function isRunning() {
    return this._running;
};

Engine.prototype.step = function step (time) {
    for (var i = 0, len = this._updates.length ; i < len ; i++) {
        this._updates[i].update(time);
    }
    return this;
};

Engine.prototype.loop = function loop(time) {
    this.step(time);
    if (this._running) {
        rAF(this._looper);
    }
    return this;
};

Engine.prototype.update = function update(item) {
    this._updates.push(item);
    return this;
};

Engine.prototype.noLongerUpdate = function noLongerUpdate(item) {
    this._updates.splice(this._updates.indexOf(item), 1);
    return this;
};

module.exports = Engine;
