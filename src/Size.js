'use strict';

function Size (context) {
    this._context = context;
    this._size = [0, 0, 0];
    this._proportions = [1, 1, 1];
    this._differential = [0, 0, 0];
    this._absolute = [0, 0, 0];
    this._absoluteSized = [false, false, false];
    this._bottomUpSize = [0, 0, 0];
    this._invalidated = 0;
    this._previouslyInvalidated = 0;
}

Size.prototype.get = function get () {
    if (this._context._dispatch.hasRenderables())
        return this._context._dispatch.getTotalRenderableSize();
    else
        return this.getTopDownSize();
};

Size.prototype.setProportions = function (x, y, z) {
    if (x !== this._proportions[0] && x != null) {
        this._proportions[0] = x;
        this._invalidated |= 1;
    }
    if (y !== this._proportions[1] && y != null) {
        this._proportions[1] = y;
        this._invalidated |= 2;
    }
    if (z !== this._proportions[2] && z != null) {
        this._proportions[2] = z;
        this._invalidated |= 4;
    }
};

Size.prototype.setDifferential = function setDifferential (x, y, z) {
    if (x !== this._differential[0] && x != null) {
        this._differential[0] = x;
        this._invalidated |= 1;
    }
    if (y !== this._differential[1] && y != null) {
        this._differential[1] = y;
        this._invalidated |= 2;
    }
    if (z !== this._differential[2] && z != null) {
        this._differential[2] = z;
        this._invalidated |= 4;
    }
};

Size.prototype._setAbsolute = function _setAbsolute (x, y, z) {
    if (x !== this._absolute[0] && x != null) {
        this._absolute[0] = x;
        this._invalidated |= 1;
    }
    if (y !== this._absolute[1] && y != null) {
        this._absolute[1] = y;
        this._invalidated |= 2;
    }
    if (z !== this._absolute[2] && z != null) {
        this._absolute[2] = z;
        this._invalidated |= 4;
    }
};

Size.prototype.setAbsolute = function setAbsolute (x, y, z) {
    this._absoluteSized[0] = x != null;
    this._absoluteSized[1] = y != null;
    this._absoluteSized[2] = z != null;
    this._setAbsolute(x, y, z);
    return this;
};

Size.prototype.getTopDownSize = function getTopDownSize () {
    return this._size;
};

Size.prototype._update = function _update(parentReport, parentSize) {
    this._invalidated |= parentReport;
    if (this._invalidated & 1)
        if (this._absoluteSized[0]) this._size[0] = this._absolute[0];
        else this._size[0] = parentSize[0] * this._proportions[0] + this._differential[0];
    if (this._invalidated & 2)
        if (this._absoluteSized[1]) this._size[1] = this._absolute[1];
        else this._size[1] = parentSize[1] * this._proportions[1] + this._differential[1];
    if (this._invalidated & 4)
        if (this._absoluteSized[2]) this._size[2] = this._absolute[2];
        else this._size[2] = parentSize[2] * this._proportions[2] + this._differential[2];
    this._previouslyInvalidated = this._invalidated;
    this._invalidated = 0;
    return this._previouslyInvalidated;
};

Size.prototype.toIdentity = function toIdentity () {
    this._absolute[0] = this._absolute[1] = this._absolute[2] = 0;
    this._differential[0] = this._differential[1] = this._differential[2] = 0;
    this._proportions[0] = this._proportions[1] = this._proportions[2] = 1;
    this._invalidated = 7;
    return this;
};

module.exports = Size;
