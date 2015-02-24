'use strict';

var Transform = require('famous-math').Transform;

function Align () {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.transform = new Transform();
}

Align.prototype.setX = function setX (x) {
    this.x = x;
    return this;
};

Align.prototype.setY = function setY (y) {
    this.y = y;
    return this;
};

Align.prototype.setZ = function setZ (z) {
    this.z = z;
    return this;
};

Align.prototype.set = function set (x, y, z) {
    this.x = x != null ? x : this.x;
    this.y = y != null ? y : this.y;
    this.z = z != null ? z : this.z;
    return this;
};

Align.prototype.update = function update (size) {
    var x = size[0] * this.x;
    var y = size[1] * this.y;
    var z = size[2] * this.z;
    this.transform.setTranslation(x, y, z);
    return this.transform;
};

module.exports = Align;
