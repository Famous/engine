'use strict';

function Opacity () {
    this.value = 1;
    this.isActive = false;
    this.dirty = false;
}

Opacity.prototype.set = function set (value) {
    this.isActive = true;
    if (this.value !== value && value != null) {
        this.value = value;
        this.setDirty();
    }
    return this;
};

Opacity.prototype.setDirty = function setDirty () {
    this.dirty = true;
    return this;
};

Opacity.prototype.clean = function clean () {
    this.dirty = false;
    return this;
};

module.exports = Opacity;
