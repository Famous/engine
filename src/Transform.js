
var IDENT = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
];

var ONES = [1, 1, 1];
var ZEROS = [0, 0, 0];


function Transform (dispatch) {
    this._id = dispatch.addComponent(this);
    this._dispatch = dispatch;

    this._requestingUpdate = false;

    this._parentMatrix = new Float32Array(IDENT);
    this._align = new Float32Array(ZEROS);
    this._mountPoint = new Float32Array(ZEROS);
    this._origin = new Float32Array(ZEROS);
    this._position = new Float32Array(ZEROS);
    this._rotation = new Float32Array(ZEROS);
    this._scale = new Float32Array(ONES);
    this._matrix = new Float32Array(IDENT);
}

Transform.prototype._requestUpdate = function _requestUpdate () {
    if (!this._requestingUpdate) this._dispatch.requestUpdate(this._id);
    this._requestingUpdate = true;
};

Transform.prototype.onUpdate = function onUpdate () {
    var target = this._matrix;

    // local cache of everything
    var p00         = this._parentMatrix[0];
    var p01         = this._parentMatrix[1];
    var p02         = this._parentMatrix[2];
    var p03         = this._parentMatrix[3];
    var p10         = this._parentMatrix[4];
    var p11         = this._parentMatrix[5];
    var p12         = this._parentMatrix[6];
    var p13         = this._parentMatrix[7];
    var p20         = this._parentMatrix[8];
    var p21         = this._parentMatrix[9];
    var p22         = this._parentMatrix[10];
    var p23         = this._parentMatrix[11];
    var p30         = this._parentMatrix[12];
    var p31         = this._parentMatrix[13];
    var p32         = this._parentMatrix[14];
    var p33         = this._parentMatrix[15];
    var alignX      = this._align[0];
    var alignY      = this._align[1];
    var alignZ      = this._align[2];
    var mountPointX = this._mountPoint[0];
    var mountPointY = this._mountPoint[1];
    var mountPointZ = this._mountPoint[2];
    var originX     = this._origin[0];
    var originY     = this._origin[1];
    var originZ     = this._origin[2];
    var cosX        = Math.cos(x);
    var cosY        = Math.cos(y);
    var coxZ        = Math.cos(z);
    var sinX        = Math.sin(x);
    var sinY        = Math.sin(y);
    var sinZ        = Math.sin(z);
    var exprA = (cosY * cosZ);
    var exprB = (cosX * sinZ + sinX * sinY * cosZ);
    var exprC = (sinX * sinZ - cosX * sinY * cosZ) * scaleX;
    var exprD = (-cosY * sinZ);
    var exprE = (cosX * cosZ - sinX * sinY * sinZ);
    var exprF = (sinX * cosZ + cosX * sinY * sinZ) * scaleY;
    var exprG = (-sinX * cosY);
    var exprH = (cosX * cosY) * scaleZ;
    var exprI = exprC * originX;
    var exprJ = exprF * originY;
    var exprK = exprH * originZ;
    var polysA = p00 * exprA;
    var polysB = p10 * exprB;
    var polysC = p01 * exprA;
    var polysD = p11 * exprB;
    var polysE = p02 * exprA;
    var polysF = p12 * exprB;
    var polysG = p03 * exprA;
    var polysH = p13 * exprB;
    var polysI = p00 * exprD;
    var polysJ = p10 * exprE;
    var polysK = p01 * exprD;
    var polysL = p11 * exprE;
    var polysM = p02 * exprD;
    var polysN = p12 * exprE;
    var polysO = p03 * exprD;
    var polysP = p13 * exprE;
    var polysQ = p00 * sinY;
    var polysR = p10 * exprG;
    var polysS = p01 * sinY;
    var polysT = p11 * exprG;
    var polysU = p02 * sinY;
    var polysV = p12 * exprG;
    var polysW = p03 * sinY;
    var polysX = p13 * exprG;
    var offsetX = p00 * (-originX) + p10 * (-originY) + p20 * (-originZ) + p00 * (-mountPointX) + p10 * (-mountPointY) + p20 * (-mountPointZ) + p00 * alignX + p10 * alignY + p20 * alignZ + p30;
    var offsetY = p01 * (-originX) + p11 * (-originY) + p21 * (-originZ) + p01 * (-mountPointX) + p11 * (-mountPointY) + p21 * (-mountPointZ) + p01 * alignX + p11 * alignY + p21 * alignZ + p31;
    var offsetZ = p02 * (-originX) + p12 * (-originY) + p22 * (-originZ) + p02 * (-mountPointX) + p12 * (-mountPointY) + p22 * (-mountPointZ) + p02 * alignX + p12 * alignY + p22 * alignZ + p32;
    var offsetW = p03 * (-originX) + p13 * (-originY) + p23 * (-originZ) + p03 * (-mountPointX) + p13 * (-mountPointY) + p23 * (-mountPointZ) + p03 * alignX + p13 * alignY + p23 * alignZ + p33;

    target[0] = polysA + polysB + p20 * exprC;
    target[1] = polysC + polysD + p21 * exprC;
    target[2] = polysE + polysF + p22 * exprC;
    target[3] = polysG + polysH + p23 * exprC;
    target[4] = polysI + polysJ + p20 * exprF;
    target[5] = polysK + polysL + p21 * exprF;
    target[6] = polysM + polysN + p22 * exprF;
    target[7] = polysO + polysP + p23 * exprF;
    target[8] = polysQ + polysR + p20 * exprH;
    target[9] = polysS + polysT + p21 * exprH;
    target[10] = polysU + polysV + p22 * exprH;
    target[11] = polysW + polysX + p23 * exprH;
    target[12] = polysA + polysB + p20 * exprI + polysI + polysJ + p20 * exprJ + polysQ + polysR + p20 * exprK + p00 * posX + p10 * posY + p20 * posZ + offsetX;
    target[13] = polysC + polysD + p21 * exprI + polysK + polysL + p21 * exprJ + polysS + polysT + p21 * exprK + p01 * posX + p11 * posY + p21 * posZ + offsetY;
    target[14] = polysE + polysF + p22 * exprI + polysM + polysN + p22 * exprJ + polysU + polysV + p22 * exprK + p02 * posX + p12 * posY + p22 * posZ + offsetZ;
    target[15] = polysG + polysH + p23 * exprI + polysO + polysP + p23 * exprJ + polysW + polysX + p23 * exprK + p03 * posX + p13 * posY + p23 * posZ + offsetW;


    this._dispatch.getContext().setTransform(target);

    this._requestingUpdate = false;
};

Transform.prototype.onParentTransformChange = function onParentTransformChange (report, transform) {
    this._parentMatrix[0] = transform[0];
    this._parentMatrix[1] = transform[1];
    this._parentMatrix[2] = transform[2];
    this._parentMatrix[3] = transform[3];
    this._parentMatrix[4] = transform[4];
    this._parentMatrix[5] = transform[5];
    this._parentMatrix[6] = transform[6];
    this._parentMatrix[7] = transform[7];
    this._parentMatrix[8] = transform[8];
    this._parentMatrix[9] = transform[9];
    this._parentMatrix[10] = transform[10];
    this._parentMatrix[11] = transform[11];
    this._parentMatrix[12] = transform[12];
    this._parentMatrix[13] = transform[13];
    this._parentMatrix[14] = transform[14];
    this._parentMatrix[15] = transform[15];
    if (!this._requestingUpdate) this._requestUpdate();
}

Transform.prototype.onAlignChange = function onAlignChange (report, x, y, z) {
    this._align[0] = x;
    this._align[1] = y;
    this._align[2] = z;
    if (!this._requestingUpdate) this._requestUpdate();
};

Transform.prototype.onMountPointChange = function onMountPointChange (report, x, y, z) {
    this._mountPoint[0] = x;
    this._mountPoint[1] = y;
    this._mountPoint[2] = z;
    if (!this._requestingUpdate) this._requestUpdate();
};

Transform.prototype.onOriginChange = function onOriginChange (report, x, y, z) {
    this._origin[0] = x;
    this._origin[1] = y;
    this._origin[2] = z;
    if (!this._requestingUpdate) this._requestUpdate();
}

Transform.prototype.onPositionChange = function onPositionChange (report, x, y, z) {
    this._position[0] = x;
    this._position[1] = y;
    this._position[2] = z;
    if (!this._requestingUpdate) this._requestUpdate();
};

Transform.prototype.onRotationChange = function onRotationChange (report, x, y, z) {
    this._rotation[0] = x;
    this._rotation[1] = y;
    this._rotation[2] = z;
    if (!this._requestingUpdate) this._requestUpdate();
};

Transform.prototype.onScaleChange = function onScaleChange (report, x, y, z) {
    this._scale[0] = x;
    this._scale[1] = y;
    this._scale[2] = z;
    if (!this._requestingUpdate) this._requestUpdate();
};

module.exports = Transform;
