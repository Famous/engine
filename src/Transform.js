'use strict';

// CONSTS
var IDENTITY = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

// Functions to be run when an index is marked as invalidated
var VALIDATORS = [
    function validate0(parent, vectors, memory) {
        return parent[0] * (memory[2] * memory[4]) * vectors.scale[0] + parent[4] * (memory[0] * memory[5] + memory[1] * memory[3] * memory[4]) * vectors.scale[0] + parent[8] * (memory[1] * memory[5] - memory[0] * memory[3] * memory[4]) * vectors.scale[0];
    },
    function validate1(parent, vectors, memory) {
        return parent[1] * (memory[2] * memory[4]) * vectors.scale[0] + parent[5] * (memory[0] * memory[5] + memory[1] * memory[3] * memory[4]) * vectors.scale[0] + parent[9] * (memory[1] * memory[5] - memory[0] * memory[3] * memory[4]) * vectors.scale[0];
    },
    function validate2(parent, vectors, memory) {
        return parent[2] * (memory[2] * memory[4]) * vectors.scale[0] + parent[6] * (memory[0] * memory[5] + memory[1] * memory[3] * memory[4]) * vectors.scale[0] + parent[10] * (memory[1] * memory[5] - memory[0] * memory[3] * memory[4]) * vectors.scale[0];
    },
    function validate3(parent, vectors, memory) {
        return parent[3] * (memory[2] * memory[4]) * vectors.scale[0] + parent[7] * (memory[0] * memory[5] + memory[1] * memory[3] * memory[4]) * vectors.scale[0] + parent[11] * (memory[1] * memory[5] - memory[0] * memory[3] * memory[4]) * vectors.scale[0];
    },
    function validate4(parent, vectors, memory) {
        return parent[0] * (-memory[2] * memory[5]) * vectors.scale[1] + parent[4] * (memory[0] * memory[4] - memory[1] * memory[3] * memory[5]) * vectors.scale[1] + parent[8] * (memory[1] * memory[4] + memory[0] * memory[3] * memory[5]) * vectors.scale[1];
    },
    function validate5(parent, vectors, memory) {
        return parent[1] * (-memory[2] * memory[5]) * vectors.scale[1] + parent[5] * (memory[0] * memory[4] - memory[1] * memory[3] * memory[5]) * vectors.scale[1] + parent[9] * (memory[1] * memory[4] + memory[0] * memory[3] * memory[5]) * vectors.scale[1];
    },
    function validate6(parent, vectors, memory) {
        return parent[2] * (-memory[2] * memory[5]) * vectors.scale[1] + parent[6] * (memory[0] * memory[4] - memory[1] * memory[3] * memory[5]) * vectors.scale[1] + parent[10] * (memory[1] * memory[4] + memory[0] * memory[3] * memory[5]) * vectors.scale[1];
    },
    function validate7(parent, vectors, memory) {
        return parent[3] * (-memory[2] * memory[5]) * vectors.scale[1] + parent[7] * (memory[0] * memory[4] - memory[1] * memory[3] * memory[5]) * vectors.scale[1] + parent[11] * (memory[1] * memory[4] + memory[0] * memory[3] * memory[5]) * vectors.scale[1];
    },
    function validate8(parent, vectors, memory) {
        return parent[0] * (memory[3]) * vectors.scale[2] + parent[4] * (-memory[1] * memory[2]) * vectors.scale[2] + parent[8] * (memory[0] * memory[2]) * vectors.scale[2];
    },
    function validate9(parent, vectors, memory) {
        return parent[1] * (memory[3]) * vectors.scale[2] + parent[5] * (-memory[1] * memory[2]) * vectors.scale[2] + parent[9] * (memory[0] * memory[2]) * vectors.scale[2];
    },
    function validate10(parent, vectors, memory) {
        return parent[2] * (memory[3]) * vectors.scale[2] + parent[6] * (-memory[1] * memory[2]) * vectors.scale[2] + parent[10] * (memory[0] * memory[2]) * vectors.scale[2];
    },
    function validate11(parent, vectors, memory) {
        return parent[3] * (memory[3]) * vectors.scale[2] + parent[7] * (-memory[1] * memory[2]) * vectors.scale[2] + parent[11] * (memory[0] * memory[2]) * vectors.scale[2];
    },
    function validate12(parent, vectors, memory) {
        return parent[0] * vectors.translation[0] + parent[4] * vectors.translation[1] + parent[8] * vectors.translation[2] + parent[12];
    },
    function validate13(parent, vectors, memory) {
        return parent[1] * vectors.translation[0] + parent[5] * vectors.translation[1] + parent[9] * vectors.translation[2] + parent[13];
    },
    function validate14(parent, vectors, memory) {
        return parent[2] * vectors.translation[0] + parent[6] * vectors.translation[1] + parent[10] * vectors.translation[2] + parent[14];
    },
    function validate15(parent, vectors, memory) {
        return parent[3] * vectors.translation[0] + parent[7] * vectors.translation[1] + parent[11] * vectors.translation[2] + parent[15];
    }
];

// Map of invalidation numbers
var DEPENDENTS = {
    global: [4369, 8738, 17476, 34952, 4369, 8738, 17476, 34952, 4369, 8738, 17476, 34952, 4096, 8192, 16384, 32768],
    local: {
        translation: [61440, 61440, 61440],
        rotation: [4095, 4095, 255],
        scale: [4095, 4095, 4095]
    }
};

/**
 * Transform is a component that is part of every Entity.  It is
 *   responsible for updating it's own notion of position in space and
 *   incorporating that with parent information.
 *
 * @class Transform
 * @component
 * @constructor
 */
function Transform() {
    this._matrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    this._memory = new Float32Array([1, 0, 1, 0, 1, 0]);
    this._vectors = {
        translation: new Float32Array([0, 0, 0]),
        rotation: new Float32Array([0, 0, 0]),
        scale: new Float32Array([1, 1, 1])
    };
    this._invalidated = 0;
    this._previouslyInvalidated = 0;
}

/**
 * Return the transform matrix that represents this Transform's values
 *   being applied to it's parent's global transform.
 *
 * @method getGlobalMatrix
 *
 * @return {Float32 Array} representation of this Transform being applied to it's parent
 */
Transform.prototype.getGlobalMatrix = function getGlobalMatrix() {
    return this._matrix;
};

/**
 * Return the vectorized information for this Transform's local
 *   transform.
 *
 * @method getLocalVectors
 *
 * @return {Object} object with translate, rotate, and scale keys
 */
Transform.prototype.getLocalVectors = function getVectors() {
    return this._vectors;
};

/**
 * Updates the local invalidation scheme based on parent information
 *
 * @method _invalidateFromParent
 * @private
 *
 * @param  {Number} parentReport parent's invalidation
 */
Transform.prototype._invalidateFromParent = function _invalidateFromParent(parentReport) {
    var counter = 0;
    while (parentReport) {
        if (parentReport & 1) this._invalidated |= DEPENDENTS.global[counter];
        counter++;
        parentReport >>>= 1;
    }
};

Transform.prototype._isIdentity = function _isIdentity() {
    var vectors = this._vectors;
    var trans = vectors.translation;
    var rot = vectors.rotation;
    var scale = vectors.scale;
    return !(trans[0] || trans[1] || trans[2] || rot[0] || rot[1] || rot[2]) && scale[0] && scale[1] && scale[2];
};

Transform.prototype._copyParent = function _copyParent(parentReport, parentMatrix) {
    var report = parentReport;
    if (parentReport) {
        this._previouslyInvalidated = parentReport;
        var counter = 0;
        while (report) {
            if (report & 1) this._matrix[counter] = parentMatrix[counter];
            counter++;
            report >>>= 1;
        }
    }
    return parentReport;
};

/**
 * Update the global matrix based on local and parent invalidations.
 *
 * @method  _update
 * @private
 *
 * @param  {Number} parentReport invalidations associated with the parent matrix
 * @param  {Array} parentMatrix parent transform matrix as an Array
 * @return {Number} invalidation scheme
 */
Transform.prototype._update = function _update(parentReport, parentMatrix) {
    if (!(parentReport || this._invalidated)) return 0;
    if (this._isIdentity()) return this._copyParent(parentReport, parentMatrix);
    if (parentReport) this._invalidateFromParent(parentReport);
    if (!parentMatrix) parentMatrix = IDENTITY;
    var update;
    var counter = 0;
    var invalidated = this._invalidated;

    // Based on invalidations update only the needed indicies
    while (this._invalidated) {
        if (this._invalidated & 1) {
            update = VALIDATORS[counter](parentMatrix, this._vectors, this._memory);
            if (update !== this._matrix[counter])
                this._matrix[counter] = update;
            else
                invalidated &= ((1 << 16) - 1) ^ (1 << counter);
        }

        counter++;
        this._invalidated >>>= 1;
    }

    this._previouslyInvalidated = invalidated;

    return invalidated;
};

/**
 * Add extra translation to the current values.  Invalidates
 *   translation as needed.
 *
 * @method translate
 *
 * @param  {Number} x translation along the x-axis in pixels
 * @param  {Number} y translation along the y-axis in pixels
 * @param  {Number} z translation along the z-axis in pixels
 */
Transform.prototype.translate = function translate(x, y, z) {
    var translation = this._vectors.translation;
    var dirty = false;
    var size;

    if (x) {
        translation[0] += x;
        dirty = true;
    }

    if (y) {
        translation[1] += y;
        dirty = true;
    }

    if (z) {
        translation[2] += z;
        dirty = true;
    }

    if (dirty) this._invalidated |= 61440;
};

/**
 * Add extra rotation to the current values.  Invalidates
 *   rotation as needed.
 *
 * @method rotate
 *
 * @param  {Number} x rotation about the x-axis in radians
 * @param  {Number} y rotation about the y-axis in radians
 * @param  {Number} z rotation about the z-axis in radians
 */
Transform.prototype.rotate = function rotate(x, y, z) {
    var rotation = this._vectors.rotation;
    this.setRotation((x ? x : 0) + rotation[0], (y ? y : 0) + rotation[1], (z ? z : 0) + rotation[2]);
};

/**
 * Add extra scale to the current values.  Invalidates
 *   scale as needed.
 *
 * @method scale
 *
 * @param  {Number} x scale along the x-axis as a percent
 * @param  {Number} y scale along the y-axis as a percent
 * @param  {Number} z scale along the z-axis as a percent
 */
Transform.prototype.scale = function scale(x, y, z) {
    var scaleVector = this._vectors.scale;
    var dirty = false;

    if (x) {
        scaleVector[0] += x;
        dirty = dirty || true;
    }

    if (y) {
        scaleVector[1] += y;
        dirty = dirty || true;
    }

    if (z) {
        scaleVector[2] += z;
        dirty = dirty || true;
    }

    if (dirty) this._invalidated |= 4095;
};

/**
 * Absolute set of the Transform's translation.  Invalidates
 *   translation as needed.
 *
 * @method setTranslation
 *
 * @param  {Number} x translation along the x-axis in pixels
 * @param  {Number} y translation along the y-axis in pixels
 * @param  {Number} z translation along the z-axis in pixels
 */
Transform.prototype.setTranslation = function setTranslation(x, y, z) {
    var translation = this._vectors.translation;
    var dirty = false;
    var size;

    if (x !== translation[0] && x != null) {
        translation[0] = x;
        dirty = dirty || true;
    }

    if (y !== translation[1] && y != null) {
        translation[1] = y;
        dirty = dirty || true;
    }

    if (z !== translation[2] && z != null) {
        translation[2] = z;
        dirty = dirty || true;
    }

    if (dirty) this._invalidated |= 61440;
};

/**
 * Return the current translation.
 *
 * @method getTranslation
 *
 * @return {Float32Array} array representing the current translation
 */
Transform.prototype.getTranslation = function getTranslation() {
    return this._vectors.translation;
};

/**
 * Absolute set of the Transform's rotation.  Invalidates
 *   rotation as needed.
 *
 * @method setRotate
 *
 * @param  {Number} x rotation about the x-axis in radians
 * @param  {Number} y rotation about the y-axis in radians
 * @param  {Number} z rotation about the z-axis in radians
 */
Transform.prototype.setRotation = function setRotation(x, y, z) {
    var rotation = this._vectors.rotation;
    var dirty = false;

    if (x !== rotation[0] && x != null) {
        rotation[0] = x;
        this._memory[0] = Math.cos(x);
        this._memory[1] = Math.sin(x);
        dirty = dirty || true;
    }

    if (y !== rotation[1] && y != null) {
        rotation[1] = y;
        this._memory[2] = Math.cos(y);
        this._memory[3] = Math.sin(y);
        dirty = dirty || true;
    }

    if (z !== rotation[2] && z != null) {
        rotation[2] = z;
        this._memory[4] = Math.cos(z);
        this._memory[5] = Math.sin(z);
        this._invalidated |= 255;
    }

    if (dirty) this._invalidated |= 4095;
};

/**
 * Return the current rotation.
 *
 * @method getRotation
 *
 * @return {Float32Array} array representing the current rotation
 */
Transform.prototype.getRotation = function getRotation() {
    return this._vectors.rotation;
};

/**
 * Absolute set of the Transform's scale.  Invalidates
 *   scale as needed.
 *
 * @method setScale
 *
 * @param  {Number} x scale along the x-axis as a percent
 * @param  {Number} y scale along the y-axis as a percent
 * @param  {Number} z scale along the z-axis as a percent
 */
Transform.prototype.setScale = function setScale(x, y, z) {
    var scale = this._vectors.scale;
    var dirty = false;

    if (x !== scale[0]) {
        scale[0] = x;
        dirty = dirty || true;
    }

    if (y !== scale[1]) {
        scale[1] = y;
        dirty = dirty || true;
    }

    if (z !== scale[2]) {
        scale[2] = z;
        dirty = dirty || true;
    }

    if (dirty) this._invalidated |= 4095;
};

/**
 * Return the current scale.
 *
 * @method getScale
 *
 * @return {Float32Array} array representing the current scale
 */
Transform.prototype.getScale = function getScale() {
    return this._vectors.scale;
};


Transform.prototype.toIdentity = function toIdentity() {
    this.setTranslation(0, 0, 0);
    this.setRotation(0, 0, 0);
    this.setScale(1, 1, 1);
    return this;
};

module.exports = Transform;
