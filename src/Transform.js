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
    var offsetX     = p00 * (-originX) + p10 * (-originY) + p20 * (-originZ) + p00 * (-mountPointX) + p10 * (-mountPointY) + p20 * (-mountPointZ) + p00 * alignX + p10 * alignY + p20 * alignZ + p30 - 1;
    var offsetY     = p01 * (-originX) + p11 * (-originY) + p21 * (-originZ) + p01 * (-mountPointX) + p11 * (-mountPointY) + p21 * (-mountPointZ) + p01 * alignX + p11 * alignY + p21 * alignZ + p31 - 1;
    var offsetZ     = p02 * (-originX) + p12 * (-originY) + p22 * (-originZ) + p02 * (-mountPointX) + p12 * (-mountPointY) + p22 * (-mountPointZ) + p02 * alignX + p12 * alignY + p22 * alignZ + p32;
    var offsetW     = p03 * (-originX) + p13 * (-originY) + p23 * (-originZ) + p03 * (-mountPointX) + p13 * (-mountPointY) + p23 * (-mountPointZ) + p03 * alignX + p13 * alignY + p23 * alignZ + p33;
    var exprA       = (cosY * cosZ);
    var exprB       = (cosX * sinZ + sinX * sinY * cosZ);
    var exprC       = (sinX * sinZ - cosX * sinY * cosZ) * scaleX;
    var exprD       = (-cosY * sinZ);
    var exprE       = (cosX * cosZ - sinX * sinY * sinZ);
    var exprF       = (sinX * cosZ + cosX * sinY * sinZ) * scaleY;
    var exprG       = (-sinX * cosY);
    var exprH       = (cosX * cosY) * scaleZ;
    var exprI       = exprC * originX;
    var exprJ       = exprF * originY;
    var exprK       = exprH * originZ;
    var polysA      = p00 * exprA + p10 * exprB;
    var polysC      = p01 * exprA + p11 * exprB;
    var polysE      = p02 * exprA + p12 * exprB;
    var polysG      = p03 * exprA + p13 * exprB;
    var polysI      = p00 * exprD + p10 * exprE;
    var polysK      = p01 * exprD + p11 * exprE;
    var polysM      = p02 * exprD + p12 * exprE;
    var polysO      = p03 * exprD + p13 * exprE;
    var polysQ      = p00 * sinY + p10 * exprG;
    var polysS      = p01 * sinY + p11 * exprG;
    var polysU      = p02 * sinY + p12 * exprG;
    var polysW      = p03 * sinY + p13 * exprG;

    target[0] = polysA + p20 * exprC;
    target[1] = polysC + p21 * exprC;
    target[2] = polysE + p22 * exprC;
    target[3] = polysG + p23 * exprC;
    target[4] = polysI + p20 * exprF;
    target[5] = polysK + p21 * exprF;
    target[6] = polysM + p22 * exprF;
    target[7] = polysO + p23 * exprF;
    target[8] = polysQ + p20 * exprH;
    target[9] = polysS + p21 * exprH;
    target[10] = polysU + p22 * exprH;
    target[11] = polysW + p23 * exprH;
    target[12] = polysA + p20 * exprI + polysI + p20 * exprJ + polysQ + p20 * exprK + p00 * posX + p10 * posY + p20 * posZ + offsetX;
    target[13] = polysC + p21 * exprI + polysK + p21 * exprJ + polysS + p21 * exprK + p01 * posX + p11 * posY + p21 * posZ + offsetY;
    target[14] = polysE + p22 * exprI + polysM + p22 * exprJ + polysU + p22 * exprK + p02 * posX + p12 * posY + p22 * posZ + offsetZ;
    target[15] = polysG + p23 * exprI + polysO + p23 * exprJ + polysW + p23 * exprK + p03 * posX + p13 * posY + p23 * posZ + offsetW;

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
