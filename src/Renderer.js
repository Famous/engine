'use strict';

var VirtualElement = require('./VirtualElement');

var FRAME = 'FRAME';
var WITH = 'WITH';
var NEED_SIZE_FOR = 'NEED_SIZE_FOR';
var TRIGGER = 'TRIGGER';

function DOMRenderer () {
    this._contexts = {};
    this._outCommands = [];
    this._inCommands = [];
    var _this = this;
    this._looper = function(time) {
        _this.loop(time);
    };
    requestAnimationFrame(this._looper);
}

DOMRenderer.prototype.step = function step (time) {
    if (this.worker) {
        this.worker.postMessage([FRAME, time]);
        this.handleCommands();
    }
};

DOMRenderer.prototype.loop = function loop (time) {
    this.step(time);
    requestAnimationFrame(this._looper)
};

DOMRenderer.prototype.sendEvent = function sendEvent (path, ev, payload) {
    this._outCommands.push(WITH, path, TRIGGER, ev, payload);
};

DOMRenderer.prototype.handleWith = function handleWith (commands) {
    var path = commands.shift()
    var pathArr = path.split('/');
    var context = this.getOrSetContext(pathArr.shift());
    var pointer = context;
    var index = pathArr.shift();
    var parent = context.element;
    while (pathArr.length) {
        if (!pointer[index]) pointer[index] = {};
        pointer = pointer[index];
        if (pointer.element) parent = pointer.element;
        index = pathArr.shift();
    }
    if (!pointer[index]) pointer[index] = {};
    pointer = pointer[index];
    var element = parent.getOrSetElement(path, index);
    element.receive(commands);
    pointer.element = element;
};

DOMRenderer.prototype.getOrSetContext = function getOrSetContext (selector) {
    if (this._contexts[selector]) return this._contexts[selector];
    var result = {
        element: new VirtualElement(document.querySelector(selector), selector, this)
    };
    result.element.setMatrix([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
    this._contexts[selector] = result;
    return result;
};

DOMRenderer.prototype.giveSizeFor = function giveSizeFor (commands) {
    var selector = commands.shift();
    var size = this.getOrSetContext(selector).element._getSize();
    var report = {
        size: size
    };
    this._outCommands.push(WITH, selector, TRIGGER, 'resize', report);
}

DOMRenderer.prototype.handleCommands = function handleCommands () {
    var commands = this._inCommands;
    var command;
    var selector;
    while (commands.length) {
        command = commands.shift();
        switch (command) {
        case WITH: this.handleWith(commands); break;
        case NEED_SIZE_FOR: this.giveSizeFor(commands); break;
        }
    }
    if (this._outCommands.length) this.sendResults();
};

DOMRenderer.prototype.receiveCommands = function receiveCommands (commands) {
    this._inCommands = this._inCommands.concat(commands);
};

DOMRenderer.prototype.sendResults = function sendResults () {
    if (this.worker.postMessage) {
        this.worker.postMessage(this._outCommands);
    } else {
        this.worker.receiveCommands(this._outCommands);
    }
    for (var i = 0, len = this._outCommands.length ; i < len ; i++) this._outCommands.shift();
};

DOMRenderer.prototype.receiveWorker = function receiveWorker (worker) {
    this.worker = worker;
};

module.exports = DOMRenderer;
