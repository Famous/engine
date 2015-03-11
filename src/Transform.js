'use strict';

// CONSTS
var IDENTITY = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

// Functions to be run when an index is marked as invalidated
Transform.prototype._validate = function _validate(counter, parent, translation, precalculated) {
    switch (counter) {
        case 0: return parent[0] * precalculated[0] + parent[4] * precalculated[1] + parent[8] * precalculated[2];
        case 1: return parent[1] * precalculated[0] + parent[5] * precalculated[1] + parent[9] * precalculated[2];
        case 2: return parent[2] * precalculated[0] + parent[6] * precalculated[1] + parent[10] * precalculated[2];
        case 3: return parent[3] * precalculated[0] + parent[7] * precalculated[1] + parent[11] * precalculated[2];
        case 4: return parent[0] * precalculated[3] + parent[4] * precalculated[4] + parent[8] * precalculated[5];
        case 5: return parent[1] * precalculated[3] + parent[5] * precalculated[4] + parent[9] * precalculated[5];
        case 6: return parent[2] * precalculated[3] + parent[6] * precalculated[4] + parent[10] * precalculated[5];
        case 7: return parent[3] * precalculated[3] + parent[7] * precalculated[4] + parent[11] * precalculated[5];
        case 8: return parent[0] * precalculated[6] + parent[4] * precalculated[7] + parent[8] * precalculated[8];
        case 9: return parent[1] * precalculated[6] + parent[5] * precalculated[7] + parent[9] * precalculated[8];
        case 10: return parent[2] * precalculated[6] + parent[6] * precalculated[7] + parent[10] * precalculated[8];
        case 11: return parent[3] * precalculated[6] + parent[7] * precalculated[7] + parent[11] * precalculated[8];
        case 12: return parent[0] * translation[0] + parent[4] * translation[1] + parent[8] * translation[2] + parent[12];
        case 13: return parent[1] * translation[0] + parent[5] * translation[1] + parent[9] * translation[2] + parent[13];
        case 14: return parent[2] * translation[0] + parent[6] * translation[1] + parent[10] * translation[2] + parent[14];
        case 15: return parent[3] * translation[0] + parent[7] * translation[1] + parent[11] * translation[2] + parent[15];
    }
};

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

    //precalculated values for validators
    this._precalculated = new Float32Array(9);
    //track what transformations were applied: [scale x, scale y, scale z, rotation x, rotaion y, rotation z]
    this._tracktransforms = [false, false, false, false, false, false];
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
    return !(trans[0] || trans[1] || trans[2] || rot[0] || rot[1] || rot[2]) && (scale[0] === 1) && (scale[1] === 1) && (scale[2] === 1);
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

    //prepare precalculations
    this._precalculateTrMatrix();

    // Based on invalidations update only the needed indicies
    while (this._invalidated) {
        if (this._invalidated & 1) {
            update = this._validate(counter, parentMatrix, this._vectors.translation, this._precalculated);
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
    var tracktransforms = this._tracktransforms;
    var dirty = false;

    if (x) {
        scaleVector[0] += x;
        dirty = dirty || true;
        tracktransforms[0] = true;
    }

    if (y) {
        scaleVector[1] += y;
        dirty = dirty || true;
        tracktransforms[1] = true;
    }

    if (z) {
        scaleVector[2] += z;
        dirty = dirty || true;
        tracktransforms[2] = true;
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
    var tracktransforms = this._tracktransforms;
    var dirty = false;

    if (x !== rotation[0] && x != null) {
        rotation[0] = x;
        this._memory[0] = Math.cos(x);
        this._memory[1] = Math.sin(x);
        dirty = dirty || true;
        tracktransforms[3] = true;
    }

    if (y !== rotation[1] && y != null) {
        rotation[1] = y;
        this._memory[2] = Math.cos(y);
        this._memory[3] = Math.sin(y);
        dirty = dirty || true;
        tracktransforms[4] = true;
    }

    if (z !== rotation[2] && z != null) {
        rotation[2] = z;
        this._memory[4] = Math.cos(z);
        this._memory[5] = Math.sin(z);
        this._invalidated |= 255;
        tracktransforms[5] = true;
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
    var tracktransforms = this._tracktransforms;
    var dirty = false;

    if (x !== scale[0]) {
        scale[0] = x;
        dirty = dirty || true;
        tracktransforms[0] = true;
    }

    if (y !== scale[1]) {
        scale[1] = y;
        dirty = dirty || true;
        tracktransforms[1] = true;
    }

    if (z !== scale[2]) {
        scale[2] = z;
        dirty = dirty || true;
        tracktransforms[2] = true;
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

Transform.prototype._precalculateAddRotation = function _precalculateAddRotation(isRotateX, isRotateY, isRotateZ) {
    var precalculated = this._precalculated;
    var memory = this._memory;

    precalculated[1] = memory[0] * memory[5] + memory[1] * memory[3] * memory[4];
    precalculated[2] = memory[1] * memory[5] - memory[0] * memory[3] * memory[4];
    precalculated[4] = memory[0] * memory[4] - memory[1] * memory[3] * memory[5];
    precalculated[5] = memory[1] * memory[4] + memory[0] * memory[3] * memory[5];

    if(isRotateY || isRotateZ) { //by y or z
        precalculated[0] = memory[2] * memory[4];
        precalculated[3] = -memory[2] * memory[5];
    }
    else {
        precalculated[0] = 1;
        precalculated[3] = 0;
    }

    if(isRotateX || isRotateY) {  //by x or y
        precalculated[7] = -memory[1] * memory[2];
        precalculated[8] = memory[0] * memory[2];
    }
    else {
        precalculated[7] = 0;
        precalculated[8] = 1
    }

    precalculated[6] = isRotateY ? memory[3] : 0; //by y
};

Transform.prototype._precalculateAddScale = function _precalculateAddScale(isScaleX, isScaleY, isScaleZ, isRotated) {
    var precalculated = this._precalculated;
    var scale = this._vectors.scale;

    if(isRotated) { // is rotated previously
        if(isScaleX){  //by x
            precalculated[0] *= scale[0];
            precalculated[1] *= scale[0];
            precalculated[2] *= scale[0];
        }

        if(isScaleY){  //by y
            precalculated[3] *= scale[1];
            precalculated[4] *= scale[1];
            precalculated[5] *= scale[1];
        }

        if(isScaleZ){  //by z
            precalculated[6] *= scale[2];
            precalculated[7] *= scale[2];
            precalculated[8] *= scale[2];
        }
    }
    else { //not rotated
        precalculated[0] = scale[0];
        precalculated[4] = scale[1];
        precalculated[8] = scale[2];
        precalculated[1] = precalculated[2] = precalculated[3] = precalculated[5] = precalculated[6] = precalculated[7] = 0;
    }
};

Transform.prototype._precalculatedSetDefault = function _precalculatedSetDefault() {
    var precalculated = this._precalculated;
    precalculated[0] = precalculated[4] = precalculated[8] = 1;
    precalculated[1] = precalculated[2] = precalculated[3] = precalculated[5] = precalculated[6] = precalculated[7] = 0;
};

Transform.prototype._precalculateTrMatrix = function _precalculateTrMatrix() {

    var tracktransforms = this._tracktransforms;
    
    //rotation should go before scale checks
    if(tracktransforms[3] || tracktransforms[4] || tracktransforms[5]){ // is rotate by x or y or z
        this._precalculateAddRotation(tracktransforms[3], tracktransforms[4], tracktransforms[5]);

        if(tracktransforms[0] || tracktransforms[1] || tracktransforms[2]){ // is scale with rotation
            this._precalculateAddScale( tracktransforms[0], tracktransforms[1], tracktransforms[2], true);
        }
    }
    else if(tracktransforms[0] || tracktransforms[1] || tracktransforms[2]){ //is scale w/o rotation
        this._precalculateAddScale( tracktransforms[0], tracktransforms[1], tracktransforms[2], false);
    }
    else {
        this._precalculatedSetDefault();
    }

};

module.exports = Transform;
