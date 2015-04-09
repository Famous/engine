'use strict';

var Dispatch = require('./Dispatcher');
var Node = require('./Node');
var Size = require('./Size');

function Context (selector, famous) {
    Node.call(this);
    this._famous = famous;

    this._dispatch = new Dispatch(this);
    this._selector = selector;

    this.onMount(this, selector);
    this._famous.message('NEED_SIZE_FOR').message(selector);
    this.show();
}

Context.prototype = Object.create(Node.prototype);
Context.prototype.constructor = Context;

Context.prototype.getUpdater = function getUpdater () {
    return this._famous;
};

Context.prototype.getSelector = function getSelector () {
    return this._selector;
};

Context.prototype.getDispatch = function getDispatch () {
    return this._dispatch;
};

Context.prototype._receiveContextSize = function _receiveContextSize (size) {
    this.setSizeMode(Size.ABSOLUTE, Size.ABSOLUTE, Size.ABSOLUTE);
    this.setAbsoluteSize(size[0], size[1], size[2]);
};

Context.prototype.onReceive = function onReceive (event, payload) {
    if (event === 'CONTEXT_RESIZE') {
        this.setSizeMode(Size.ABSOLUTE, Size.ABSOLUTE, Size.ABSOLUTE);
        this.setAbsoluteSize(payload[0], payload[1], payload[2]);
    }
};

module.exports = Context;

