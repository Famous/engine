'use strict';

var Align = require('./Align');

function MountPoint () {
    Align.call(this);
}

MountPoint.prototype = Object.create(Align.prototype);
MountPoint.prototype.constructor = MountPoint;

MountPoint.prototype.update = function update (size) {
    var x = size[0] * -this.x;
    var y = size[1] * -this.y;
    var z = size[2] * -this.z;
    this.transform.setTranslation(x, y, z);
    return this.transform;
};

module.exports = MountPoint;
