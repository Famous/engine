function Size (dispatch) {
    this._size = new Float32Array(3);
}

Size.RELATIVE = 0;
Size.ABSOLUTE = 1;
Size.RENDER = 2;
Size.DEFAULT = 0;

Size.prototype.fromSpecWithParent = function fromSpecWithParent (parentSize, spec, target) {
    var mode = spec.size.sizeMode;
    var prev;
    var changed = false;
    for (var i = 0 ; i < 3 ; i++) {
        switch (mode[i]) {
            case Size.RELATIVE:
                prev = target[i];
                target[i] = parentSize[i] * spec.size.proportional[i] + spec.size.differential[i];
                changed = changed || prev !== target[i];
                break;
            case Size.ABSOLUTE:
                prev = target[i];
                target[i] = spec.size.absolute[i];
                changed = changed || prev !== target[i];
                break;
            case Size.Render:
                break;
        }
    }
    return changed;
};

module.exports = Size;
