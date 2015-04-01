
var Famous = require('./Famous');
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
    this._selector = selector;
    this.onMount(BOTTOM, selector);
    Famous.registerContext(selector, this);
    Famous.message('NEED_SIZE_FOR').message(selector);
}

Context.prototype = Object.create(Node.prototype);
Context.prototype.constructor = Context;

Context.prototype._receiveContextSize = function _receiveContextSize (size) {
    this.setSizeMode(Size.ABSOLUTE, Size.ABSOLUTE, Size.ABSOLUTE);
    this.setAbsoluteSize(size[0], size[1], size[2]);
};

module.exports = Context;