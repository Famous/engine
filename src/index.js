'use strict';

var polyfills = require('famous-polyfills');
var rAF = polyfills.requestAnimationFrame;

var _now;
if (typeof performance !== 'undefined') {
    _now = function() {
        return performance.now();
    };
}
else {
    _now = Date.now;
}

if (typeof document !== 'undefined') {
    var VENDOR_HIDDEN, VENDOR_VISIBILITY_CHANGE;

    if (typeof document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support 
        VENDOR_HIDDEN = 'hidden';
        VENDOR_VISIBILITY_CHANGE = 'visibilitychange';
    }
    else if (typeof document.mozHidden !== 'undefined') {
        VENDOR_HIDDEN = 'mozHidden';
        VENDOR_VISIBILITY_CHANGE = 'mozvisibilitychange';
    }
    else if (typeof document.msHidden !== 'undefined') {
        VENDOR_HIDDEN = 'msHidden';
        VENDOR_VISIBILITY_CHANGE = 'msvisibilitychange';
    }
    else if (typeof document.webkitHidden !== 'undefined') {
        VENDOR_HIDDEN = 'webkitHidden';
        VENDOR_VISIBILITY_CHANGE = 'webkitvisibilitychange';
    }
}

function Engine() {
    this._updates = [];
    var _this = this;
    this.looper = function(time) {
        _this.loop(time);
    };
    this._looper = this.loop.bind(this);
    this._stoppedAt = _now();
    this._sleep = 0;
    this._startOnVisibilityChange = true;
    this.start();

    if (typeof document !== 'undefined') {
        var _this = this;
        document.addEventListener(VENDOR_VISIBILITY_CHANGE, function() {
            if (document[VENDOR_HIDDEN]) {
                var startOnVisibilityChange = _this._startOnVisibilityChange;
                _this.stop();
                _this._startOnVisibilityChange = startOnVisibilityChange;
            }
            else {
                if (_this._startOnVisibilityChange) {
                    rAF(function() {
                        _this.start();
                    });
                }
            }
        });
    }
}

Engine.prototype.start = function start() {
    this._startOnVisibilityChange = true;
    this._running = true;
    this._sleep += _now() - this._stoppedAt;
    rAF(this._looper);
    return this;
};

Engine.prototype.stop = function stop() {
    this._startOnVisibilityChange = false;
    this._running = false;
    this._stoppedAt = _now();
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
    this.step(time - this._sleep);
    if (this._running) {
        rAF(this._looper);
    }
    return this;
};

Engine.prototype.update = function update(item) {
    if (this._updates.indexOf(item) === -1) this._updates.push(item);
    return this;
};

Engine.prototype.noLongerUpdate = function noLongerUpdate(item) {
    this._updates.splice(this._updates.indexOf(item), 1);
    return this;
};

module.exports = Engine;
