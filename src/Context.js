
var Famous = require('./Famous');
var Dispatch = require('./Dispatcher');
var Node = require('./Node');
var Size = require('./Size');

var IDENT = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
]);

var ZEROS = new Float32Array(3);

var BOTTOM = {
    getTransform: function getTransform () {
        return IDENT;
    },
    getSize: function getSize () {
        return ZEROS;
    },
    getUpdater: function getUpdater () {
        return Famous;
    }
};

function Context (selector) {
    Node.call(this);
    this._dispatch = new Dispatch(this);
    this._selector = selector;

    this.onMount(BOTTOM, selector);
    Famous.registerContext(selector, this);
    Famous.message('NEED_SIZE_FOR').message(selector);
    this.show();
}

Context.prototype = Object.create(Node.prototype);
Context.prototype.constructor = Context;

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

