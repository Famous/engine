'use strict';

function Transform () {
    this._matrix = new Float32Array(16);
    this._scratch = new Float32Array(67);
}

Transform.prototype.get = function get () {
    return this._matrix;
};

Transform.prototype.fromSpecWithParent = function fromSpecWithParent (parentMatrix, spec, mySize, parentSize, target) {
    target = target ? target : this._matrix;

    // local cache of everything
    var t00         = target[0];
    var t01         = target[1];
    var t02         = target[2];
    var t03         = target[3];
    var t10         = target[4];
    var t11         = target[5];
    var t12         = target[6];
    var t13         = target[7];
    var t20         = target[8];
    var t21         = target[9];
    var t22         = target[10];
    var t23         = target[11];
    var t30         = target[12];
    var t31         = target[13];
    var t32         = target[14];
    var t33         = target[15];
    var p00         = parentMatrix[0];
    var p01         = parentMatrix[1];
    var p02         = parentMatrix[2];
    var p03         = parentMatrix[3];
    var p10         = parentMatrix[4];
    var p11         = parentMatrix[5];
    var p12         = parentMatrix[6];
    var p13         = parentMatrix[7];
    var p20         = parentMatrix[8];
    var p21         = parentMatrix[9];
    var p22         = parentMatrix[10];
    var p23         = parentMatrix[11];
    var p30         = parentMatrix[12];
    var p31         = parentMatrix[13];
    var p32         = parentMatrix[14];
    var p33         = parentMatrix[15];
    var posX        = spec.vectors.position[0];
    var posY        = spec.vectors.position[1];
    var posZ        = spec.vectors.position[2];
    var rotX        = spec.vectors.rotation[0];
    var rotY        = spec.vectors.rotation[1];
    var rotZ        = spec.vectors.rotation[2];
    var scaleX      = spec.vectors.scale[0];
    var scaleY      = spec.vectors.scale[1];
    var scaleZ      = spec.vectors.scale[2];
    var alignX      = spec.offsets.align[0] * parentSize[0];
    var alignY      = spec.offsets.align[1] * parentSize[1];
    var alignZ      = spec.offsets.align[2] * parentSize[2];
    var mountPointX = spec.offsets.mountPoint[0] * mySize[0];
    var mountPointY = spec.offsets.mountPoint[1] * mySize[1];
    var mountPointZ = spec.offsets.mountPoint[2] * mySize[2];
    var originX     = spec.offsets.origin[0] * mySize[0];
    var originY     = spec.offsets.origin[1] * mySize[1];
    var originZ     = spec.offsets.origin[2] * mySize[2];
    var cosX        = Math.cos(rotX);
    var cosY        = Math.cos(rotY);
    var cosZ        = Math.cos(rotZ);
    var sinX        = Math.sin(rotX);
    var sinY        = Math.sin(rotY);
    var sinZ        = Math.sin(rotZ);
    var expr0       = (cosY * cosZ);
    var expr1       = (cosX * sinZ + sinX * sinY * cosZ);
    var expr2       = (sinX * sinZ - cosX * sinY * cosZ);
    var expr3       = (cosX * cosZ - sinX * sinY * sinZ);
    var expr4       = (-cosY * sinZ);
    var expr5       = (sinX * cosZ + cosX * sinY * sinZ);
    var expr6       = (-sinX * cosY);
    var expr7       = (cosX * cosY);
 
    target[0]  = (p00 * expr0 + p10 * expr1 + p20 * expr2) * scaleX;
    target[1]  = (p01 * expr0 + p11 * expr1 + p21 * expr2) * scaleX;
    target[2]  = (p02 * expr0 + p12 * expr1 + p22 * expr2) * scaleX;
    target[3]  = (p03 * expr0 + p13 * expr1 + p23 * expr2) * scaleX;
    target[4]  = (p00 * expr4 + p10 * expr3 + p20 * expr5) * scaleY;
    target[5]  = (p01 * expr4 + p11 * expr3 + p21 * expr5) * scaleY;
    target[6]  = (p02 * expr4 + p12 * expr3 + p22 * expr5) * scaleY;
    target[7]  = (p03 * expr4 + p13 * expr3 + p23 * expr5) * scaleY;
    target[8]  = (p00 * sinY + p10 * expr6 + p20 * expr7) * scaleZ;
    target[9]  = (p01 * sinY + p11 * expr6 + p21 * expr7) * scaleZ;
    target[10] = (p02 * sinY + p12 * expr6 + p22 * expr7) * scaleZ;
    target[11] = (p03 * sinY + p13 * expr6 + p23 * expr7) * scaleZ;
    target[12] = ((((((p00 * expr0) + (p10 * expr1)) + (p20 * expr2)) * scaleX) * originX) + (((((p00 * expr4) + (p10 * expr3)) + (p20 * expr5)) * scaleY) * originY)) + ((((((p00 * sinY) + (p10 * expr6)) + (p20 * expr7)) * scaleZ) * originZ) + (((p00 * posX) + (p10 * posY)) + ((p20 * posZ) + (((p00 * -originX) + (p10 * -originY)) + ((p20 * -originZ) + (((p00 * -mountPointX) + (p10 * -mountPointY)) + ((p20 * -mountPointZ) + (((p00 * alignX) + (p10 * alignY)) + ((p20 * alignZ) + p30)))))))));
    target[13] = ((((((p01 * expr0) + (p11 * expr1)) + (p21 * expr2)) * scaleX) * originX) + (((((p01 * expr4) + (p11 * expr3)) + (p21 * expr5)) * scaleY) * originY)) + ((((((p01 * sinY) + (p11 * expr6)) + (p21 * expr7)) * scaleZ) * originZ) + (((p01 * posX) + (p11 * posY)) + ((p21 * posZ) + (((p01 * -originX) + (p11 * -originY)) + ((p21 * -originZ) + (((p01 * -mountPointX) + (p11 * -mountPointY)) + ((p21 * -mountPointZ) + (((p01 * alignX) + (p11 * alignY)) + ((p21 * alignZ) + p31)))))))));
    target[14] = ((((((p02 * expr0) + (p12 * expr1)) + (p22 * expr2)) * scaleX) * originX) + (((((p02 * expr4) + (p12 * expr3)) + (p22 * expr5)) * scaleY) * originY)) + ((((((p02 * sinY) + (p12 * expr6)) + (p22 * expr7)) * scaleZ) * originZ) + (((p02 * posX) + (p12 * posY)) + ((p22 * posZ) + (((p02 * -originX) + (p12 * -originY)) + ((p22 * -originZ) + (((p02 * -mountPointX) + (p12 * -mountPointY)) + ((p22 * -mountPointZ) + (((p02 * alignX) + (p12 * alignY)) + ((p22 * alignZ) + p32)))))))));
    target[15] = ((((((p03 * expr0) + (p13 * expr1)) + (p23 * expr2)) * scaleX) * originX) + (((((p03 * expr4) + (p13 * expr3)) + (p23 * expr5)) * scaleY) * originY)) + ((((((p03 * sinY) + (p13 * expr6)) + (p23 * expr7)) * scaleZ) * originZ) + (((p03 * posX) + (p13 * posY)) + ((p23 * posZ) + (((p03 * -originX) + (p13 * -originY)) + ((p23 * -originZ) + (((p03 * -mountPointX) + (p13 * -mountPointY)) + ((p23 * -mountPointZ) + (((p03 * alignX) + (p13 * alignY)) + ((p23 * alignZ) + p33)))))))));

    return t00 !== target[0] ||
        t01 !== target[1] ||
        t02 !== target[2] ||
        t03 !== target[3] ||
        t10 !== target[4] ||
        t11 !== target[5] ||
        t12 !== target[6] ||
        t13 !== target[7] ||
        t20 !== target[8] ||
        t21 !== target[9] ||
        t22 !== target[10] ||
        t23 !== target[11] ||
        t30 !== target[12] ||
        t31 !== target[13] ||
        t32 !== target[14] ||
        t33 !== target[15];

};

module.exports = Transform;
