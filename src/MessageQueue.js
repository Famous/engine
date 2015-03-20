'use strict';

/**
 * Used for scheduling messages to be sent on the next FRAME.
 * The MessageQueue is being cleared after each `postMessage` in the `Famous`
 * singleton.
 *
 * @class  MessageQueue
 * @constructor
 * @private
 */
function MessageQueue() {
    this._messages = [];
}

/**
 * Pushes a message to the end of the queue to be sent on the next FRAME.
 *
 * @method  enqueue
 * @chainable
 * 
 * @param  {Object} message message to be appended to the queue
 * @return {MessageQueue}   this
 */
MessageQueue.prototype.enqueue = function enqueue (message) {
    this._messages.push(message);
    return this;
};

/**
 * Returns an array of all messages currently scheduled for the next FRAME.
 *
 * @method  getAll
 * @chainable
 * 
 * @return {MessageQueue} this
 */
MessageQueue.prototype.getAll = function getAll () {
    return this._messages;
};

/**
 * Empties the queue.
 *
 * @method  clear
 * @chainable
 * 
 * @return {MessageQueue} this
 */
MessageQueue.prototype.clear = function clear() {
    this._messages.length = 0;
    return this;
};

module.exports = MessageQueue;

