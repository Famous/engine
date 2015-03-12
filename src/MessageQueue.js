'use strict';

function MessageQueue() {
    this._messages = [];
}

MessageQueue.prototype.enqueue = function enqueue (message) {
    this._messages.push(message);
    return this;
};

MessageQueue.prototype.getAll = function getAll () {
    return this._messages;
};

MessageQueue.prototype.clear = function clear() {
    this._messages.length = 0;
    return this;
};

module.exports = MessageQueue;

