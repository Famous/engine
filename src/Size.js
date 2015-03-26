function Size (dispatch) {
    this._id = dispatch.addComponent(this);
    this._dispatch = dispatch;
    this._parentSize = new Float32Array(3);

    this._requestingUpdate = false;

    this._proportionalSize = new Float32Array([1, 1, 1]);
    this._differentialSize = new Float32Array(3);
    this._absoluteSize = new Float32Array(3);
    this._renderableSize = new Float32Array(3);
    this._contextSize = new Float32Array(3);
    this._totalSize = new Float32Array(3);

}

Size.X = 1;
Size.Y = 2;
Size.Z = 4;

Size.prototype._requestUpdate = function _requestUpdate() {
    if (!this._requestingUpdate) this._dispatch.requestUpdate(this._id);
    this._requestingUpdate = true;
};

Size.prototype.onUpdate = function onUpdate () {
    var isAbsolute = this._dispatch.getContext()._internalSpec.size.isAbsolute;
    var isAbsoluteX = isAbsolute & Size.X;
    var isAbsoluteY = isAbsolute & Size.Y;
    var isAbsoluteZ = isAbsolute & Size.Z;

    this._contextSize[0] = isAbsoluteX ? this._absoluteSize[0] : (this._parentSize[0] * this._proportionalSize[0]) + this._differentialSize[0];
    this._contextSize[1] = isAbsoluteY ? this._absoluteSize[1] : (this._parentSize[1] * this._proportionalSize[1]) + this._differentialSize[1];
    this._contextSize[2] = isAbsoluteZ ? this._absoluteSize[2] : (this._parentSize[2] * this._proportionalSize[2]) + this._differentialSize[2];

    this._dispatch.sizeChanged(this._contextSize);
    this._requestingUpdate = false;
}

Size.prototype.onProportionalSizeChange = function onProportionalSizeChange (report, x, y, z) {
    this._proportionalSize[0] = x;
    this._proportionalSize[1] = y;
    this._proportionalSize[2] = z;
    if (!this._requestingUpdate) this._requestUpdate();
};

Size.prototype.onDifferentialSizeChange = function onDifferentialSizeChange (report, x, y, z) {
    this._differentialSize[0] = x;
    this._differentialSize[1] = y;
    this._differentialSize[2] = z;
    if (!this._requestingUpdate) this._requestUpdate();
};

Size.prototype.onAbsoluteSizeChange = function onAbsoluteSizeChange (report, x, y, z) {
    this._absoluteSize[0] = x;
    this._absoluteSize[1] = y;
    this._absoluteSize[2] = z;
    if (!this._requestingUpdate) this._requestUpdate();
};

module.exports = Size;
