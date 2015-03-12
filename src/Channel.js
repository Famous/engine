'use strict';

function Channel (name, spec) {
    this.name = name;
    this.spec = spec;
}

Channel.prototype.get = function get () {
    return this.spec.get(this.name);
};

Channel.prototype.set = function set (val) {
    this.spec.set(this.name, val);
};

Channel.prototype.changed = function changed (report, val) {
    this.spec.makeChangeReport(this.name, report, val);
};

Channel.prototype.free = function free () {
    this.spec.free(this);
    this.spec = null;
};

module.exports = Channel;