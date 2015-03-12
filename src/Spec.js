'use strict';

var Channel = require('./Channel');

function Spec () {
    this._backing = {
        changes: []
    };
};

Spec.EMPTY = {};

Spec.prototype.openChannel = function openChannel (name) {
    if (this._backing[name] != null || this._backing[name] !== Spec.EMPTY)
        throw new Error('name is already used');
    return new Channel(name, this);
};

Spec.prototype.makeChangeReport = function makeChangeReport (name, repot, value) {
    this._backing.changes.push(name, report, value);
};

Spec.prototype.flushChanges = function flushChanges () {
    var changes = this._backing.changes;
    for (var i = 0, len = changes.length ; i < len ; i++)
        changes.pop();
};

Spec.prototype.get = function get (name) {
    return name != null ? this._backing[name] : this._backing;
};

Spec.prototype.set = function set (name, value) {
    this._backing[name] = value;
};

Spec.prototype.free = function free (manager) {
    this._backing[manager.name] = Spec.EMPTY;
};

module.exports = Spec;
