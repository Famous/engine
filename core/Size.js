'use strict';

/**
 * The Size class is responsible for processing Size from a node
 * @constructor {Size}
 */
function Size () {
    this._size = new Float32Array(3);
}

// an enumeration of the different types of size modes
Size.RELATIVE = 0;
Size.ABSOLUTE = 1;
Size.RENDER = 2;
Size.DEFAULT = Size.RELATIVE;

/**
 * fromSpecWithParent takes the parent node's size, the target nodes spec,
 * and a target array to write to. Using the node's size mode it calculates 
 * a final size for the node from the node's spec. Returns whether or not
 * the final size has changed from its last value.
 *
 * @param {Array} parent node's calculated size
 * @param {Node.Spec} the target node's spec
 * @param {Array} an array to write the result to
 *
 * @return {Boolean} true if the size of the node has changed.
 */
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
            case Size.RENDER:
                break;
        }
    }
    return changed;
};

module.exports = Size;
