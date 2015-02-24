'use strict';

function Origin () {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.isActive = false;
    this.dirty = false;
}

Origin.prototype._setWithoutActivating = function _setWithoutActivating (x, y, z) {
    this.set(x, y, z);
    this.isActive = false;
    return this;
};

Origin.prototype.set = function set (x, y, z) {
    this.isActive = true;
    if (this.x !== x && x != null) {
        this.x = x;
        this.setDirty();
    }
    if (this.y !== y && y != null) {
        this.y = y;
        this.setDirty();
    }
    if (this.z !== z && z != null) {
        this.z = z;
        this.setDirty();
    }
    return this;
};

Origin.prototype.setDirty = function setDirty () {
    this.dirty = true;
    return this;
};

Origin.prototype.clean = function clean () {
    this.dirty = false;
    return this;
};

module.exports = Origin;
