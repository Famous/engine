'use strict';

var Matrix = require('./Mat33');

/** @alias */
var sin = Math.sin;
/** @alias */
var cos = Math.cos;
/** @alias */
var atan2 = Math.atan2;
/** @alias */
var sqrt = Math.sqrt;

/**
 * A vector-like object used to represent rotations. If theta is the angle of
 * rotation, and (x', y', z') is a normalized vector representing the axis of
 * rotation, then w = cos(theta/2), x = -sin(theta/2)*x', y = -sin(theta/2)*y',
 * and z = -sin(theta/2)*z'.
 *
 * @class Quaternion
 * @param {Number} w The w component.
 * @param {Number} x The x component.
 * @param {Number} y The y component.
 * @param {Number} z The z component.
 */
function Quaternion(w,x,y,z) {
    this.w = w || 1;
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
}

/**
 * Add the components of input q to the current Quaternion.
 *
 * @method add
 * @param {Quaternion} q The Quaternion to add.
 * @chainable
 */
Quaternion.prototype.add = function add(q) {
    this.w += q.w;
    this.x += q.x;
    this.y += q.y;
    this.z += q.z;
    return this;
};

/**
 * Subtract the components of input q from the current Quaternion.
 *
 * @method subtract
 * @param {Quaternion} q The Quaternion to subtract.
 * @chainable
 */
Quaternion.prototype.subtract = function subtract(q) {
    this.w -= q.w;
    this.x -= q.x;
    this.y -= q.y;
    this.z -= q.z;
    return this;
};

/**
 * Scale the current Quaternion by input scalar s.
 *
 * @method scalarMultiply
 * @param {Number} s The Number by which to scale.
 * @chainable
 */
Quaternion.prototype.scale = function scale(s) {
    this.w *= s;
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
};

/**
 * Multiply the current Quaternion by input Quaternion q.
 * Left-handed coordinate system multiplication.
 *
 * @method multiply
 * @param {Quaternion} q The Quaternion to multiply by on the right.
 */
Quaternion.prototype.multiply = function multiply(q) {
    var x1 = this.x;
    var y1 = this.y;
    var z1 = this.z;
    var w1 = this.w;
    var x2 = q.x;
    var y2 = q.y;
    var z2 = q.z;
    var w2 = q.w || 0;

    this.w = w1*w2 - x1*x2 - y1*y2 - z1*z2;
    this.x = x1*w2 + x2*w1 + y2*z1 - y1*z2;
    this.y = y1*w2 + y2*w1 + x1*z2 - x2*z1;
    this.z = z1*w2 + z2*w1 + x2*y1 - x1*y2;
    return this;
};

/**
 * Multiply the current Quaternion by input Quaternion q on the left, i.e. q * this.
 * Left-handed coordinate system multiplication.
 *
 * @method leftMultiply
 * @param {Quaternion} q The Quaternion to multiply by on the left.
 */
Quaternion.prototype.leftMultiply = function leftMultiply(q) {
    var x1 = q.x;
    var y1 = q.y;
    var z1 = q.z;
    var w1 = q.w || 0;
    var x2 = this.x;
    var y2 = this.y;
    var z2 = this.z;
    var w2 = this.w;

    this.w = w1*w2 - x1*x2 - y1*y2 - z1*z2;
    this.x = x1*w2 + x2*w1 + y2*z1 - y1*z2;
    this.y = y1*w2 + y2*w1 + x1*z2 - x2*z1;
    this.z = z1*w2 + z2*w1 + x2*y1 - x1*y2;
    return this;
};

/**
 * Apply the current Quaternion to input Vec3 v, according to
 * v' = ~q * v * q.
 *
 * @method rotateVector
 * @param {Vec3} v The reference Vec3.
 * @param {Vec3} output Vec3 in which to place the result.
 * @return {Vec3} The rotated version of the Vec3.
 */
Quaternion.prototype.rotateVector = function rotateVector(v, output) {
    var cw = this.w;
    var cx = -this.x;
    var cy = -this.y;
    var cz = -this.z;

    var vx = v.x;
    var vy = v.y;
    var vz = v.z;

    var tw = -cx * vx - cy * vy - cz * vz;
    var tx = vx * cw + vy * cz - cy * vz;
    var ty = vy * cw + cx * vz - vx * cz;
    var tz = vz * cw + vx * cy - cx * vy;

    var w = cw;
    var x = -cx;
    var y = -cy;
    var z = -cz;

    output.x = tx * w + x * tw + y * tz - ty * z;
    output.y = ty * w + y * tw + tx * z - x * tz;
    output.z = tz * w + z * tw + x * ty - tx * y;
    return output;
};

/**
 * Invert the current Quaternion.
 *
 * @method invert
 * @chainable
 */
Quaternion.prototype.invert = function invert() {
    this.w *= -1;
    this.x *= -1;
    this.y *= -1;
    this.z *= -1;
    return this;
};

/**
 * Conjugate the current Quaternionl
 *
 * @method conjugate
 * @chainable
 */
Quaternion.prototype.conjugate = function conjugate() {
    this.x *= -1;
    this.y *= -1;
    this.z *= -1;
    return this;
};

/**
 * Compute the length (norm) of the current Quaternion.
 *
 * @method length
 * @return {Number}
 */
Quaternion.prototype.length = function length() {
    var w = this.w;
    var x = this.x;
    var y = this.y;
    var z = this.z;
    return sqrt(w * w + x * x + y * y + z * z);
};

/**
 * Alter the current Quaternion to be of unit length;
 *
 * @method normalize
 * @chainable
 */
Quaternion.prototype.normalize = function normalize() {
    var w = this.w;
    var x = this.x;
    var y = this.y;
    var z = this.z;
    var length = sqrt(w * w + x * x + y * y + z * z);
    if (length === 0) return;
    length = 1 / length;
    this.w *= length;
    this.x *= length;
    this.y *= length;
    this.z *= length;
    return this;
};

/**
 * Alter the current Quaternion to reflect a rotation of input angle about
 * input axis v.
 *
 * @method makeFromAngleAndAxis
 * @param {Number} angle The angle of rotation.
 * @param {Vec3} v The axis of rotation.
 * @chainable
 */
Quaternion.prototype.makeFromAngleAndAxis = function makeFromAngleAndAxis(angle, v) {
    var n  = v.normalize();
    var ha = angle*0.5;
    var s  = -sin(ha);
    this.x = s*n.x;
    this.y = s*n.y;
    this.z = s*n.z;
    this.w = cos(ha);
    return this;
};

/**
 * Set the w, x, y, z components of the current Quaternion.
 *
 * @method set
 * @param {Number} w The w component.
 * @param {Number} x The x component.
 * @param {Number} y The y component.
 * @param {Number} z The z component.
 * @chainable
 */
Quaternion.prototype.set = function set(w,x,y,z) {
    if (w != null) this.w = w;
    if (x != null) this.x = x;
    if (y != null) this.y = y;
    if (z != null) this.z = z;
    return this;
};

/**
 * Copy input Quaternion q onto the current Quaternion.
 *
 * @method copy
 * @param {Quaternion} q The reference Quaternion.
 * @chainable
 */
Quaternion.prototype.copy = function copy(q) {
    this.w = q.w;
    this.x = q.x;
    this.y = q.y;
    this.z = q.z;
    return this;
};

/**
 * Reset the current Quaternion.
 *
 * @method clear
 * @chainable
 */
Quaternion.prototype.clear = function clear() {
    this.w = 1;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    return this;
};

/**
 * The 4d dot product. Can be used to determine the cosine of the angle between
 * the two rotations, assuming both Quaternions are of unit length.
 *
 * @method dot
 * @param {Quaternion} q The other Quaternion.
 * @return {Number}
 */
Quaternion.prototype.dot = function dot(q) {
    return this.w * q.w + this.x * q.x + this.y * q.y + this.z * q.z;
};

/**
 * Get the Mat33 matrix corresponding to the current Quaternion.
 *
 * @method toMatrix
 * @return {Transform}
 */
Quaternion.prototype.toMatrix = function toMatrix(output) {
    var w = this.w;
    var x = this.x;
    var y = this.y;
    var z = this.z;

    //LHC system flattened to row major
    return output.set([
            1 - 2*y*y - 2*z*z, 2*x*y + 2*z*w, 2*x*z - 2*y*w,
            2*x*y - 2*z*w,1 - 2*x*x - 2*z*z, 2*y*z + 2*x*w,
            2*x*z + 2*y*w, 2*y*z - 2*x*w, 1 - 2*x*x - 2*y*y
    ]);
};

/**
 * Spherical linear interpolation.
 *
 * @method slerp
 * @param {Quaternion} q The final orientation.
 * @param {Number} t The tween parameter.
 * @param {Vec3} output Vec3 in which to put the result.
 * @return {Quaternion}
 */
Quaternion.prototype.slerp = function slerp(q, t, output) {
    var w = this.w;
    var x = this.x;
    var y = this.y;
    var z = this.z;

    var qw = q.w;
    var qw = q.w;
    var qw = q.w;
    var qw = q.w;

    var omega;
    var cosomega;
    var sinomega;
    var scaleFrom;
    var scaleTo;

    cosomega = w * qw + x * qx + y * qy + z * qz;
    if ((1.0 - cosomega) > 1e-5) {
        omega       = Math.acos(cosomega);
        sinomega    = sin(omega);
        scaleFrom   = sin((1.0 - t) * omega) / sinomega;
        scaleTo     = sin(t * omega) / sinomega;
    }
    else {
        scaleFrom   = 1.0 - t;
        scaleTo     = t;
    }

    var ratio = scaleFrom/scaleTo;

    output.w = w * ratio + qw * scaleTo;
    output.x = x * ratio + qx * scaleTo;
    output.y = y * ratio + qy * scaleTo;
    output.z = z * ratio + qz * scaleTo;

    return output;
};

/**
 * Helper function to clamp a value to a given range.
 *
 * @method clamp
 * @private
 * @param {Number} value The value to calmp.
 * @param {Number} lower The lower limit of the range.
 * @param {Number} upper The upper limit of the range.
 * @return {Number} The possibly clamped value.
 */
var clamp = function (value, lower, upper) {
    return value < lower ? lower : value > upper ? upper : value;
}

/**
 * The rotation angles about the x, y, and z axes corresponding to the
 * current Quaternion, when applied in the XYZ order.
 *
 * @method toEulerXYZ
 * @param {Vec3} output Vec3 in which to put the result.
 * @return {Vec3}
 */

Quaternion.prototype.toEulerXYZ = function toEulerXYZ(output) {
    var w = this.w;
    var x = this.x;
    var y = this.y;
    var z = this.z;

    var sqx = x * x;
    var sqy = y * y;
    var sqz = z * z;
    var sqw = w * w;

    output.x = atan2(2 * (x * w - y * z), (sqw - sqx - sqy + sqz));
    output.y = Math.asin(clamp(2 * (x * z + y * w), -1, 1));
    output.z = atan2(2 * (z * w - x * y), (sqw + sqx - sqy - sqz));
    return output;
};

/**
 * The Quaternion corresponding to the Euler angles x, y, and z,
 * applied in the XYZ order.
 *
 * @method fromEulerXYZ
 * @param {Number} x The angle of rotation about the x axis.
 * @param {Number} y The angle of rotation about the y axis.
 * @param {Number} z The angle of rotation about the z axis.
 * @param {Quaternion} output Quaternion in which to put the result.
 * @return {Quaternion} The equivalent Quaternion.
 */
Quaternion.fromEulerXYZ = function fromEulerXYZ(x, y, z, output) {
    var sx = sin(x/2);
    var sy = sin(y/2);
    var sz = sin(z/2);
    var cx = cos(x/2);
    var cy = cos(y/2);
    var cz = cos(z/2);

    var qw = cx*cy*cz + sx*sy*sz;
    var qx = sx*cy*cz - cx*sy*sz;
    var qy = cx*sy*cz + sx*cy*sz;
    var qz = cx*cy*sz - sx*sy*cz;

    output.w = qw;
    output.x = qx;
    output.y = qy;
    output.z = qz;
    return output;
};

/**
 * Multiply the input Quaternions.
 * Left-handed coordinate system multiplication.
 *
 * @method multiply
 * @param {Quaternion} q1 The left Quaternion.
 * @param {Quaternion} q2 The right Quaternion.
 * @param {Quaternion} output Quaternion in which to place the result.
 * @return {Quaternion} The product of multiplication.
 */
Quaternion.multiply = function multiply(q1, q2, output) {
    var w1 = q1.w || 0;
    var x1 = q1.x;
    var y1 = q1.y;
    var z1 = q1.z;

    var w2 = q2.w || 0;
    var x2 = q2.x;
    var y2 = q2.y;
    var z2 = q2.z;

    output.w = w1*w2 - x1*x2 - y1*y2 - z1*z2;
    output.x = x1*w2 + x2*w1 + y2*z1 - y1*z2;
    output.y = y1*w2 + y2*w1 + x1*z2 - x2*z1;
    output.z = z1*w2 + z2*w1 + x2*y1 - x1*y2;
    return output;
};

/**
 * The conjugate of the input Quaternion.
 *
 * @method conjugate
 * @param {Quaternion} q The reference Quaternion.
 * @param {Quaternion} output Quaternion in which to place the result.
 * @return {Quaternion} The conjugate Quaternion.
 */
Quaternion.conjugate = function conjugate(q, output) {
    output.w = q.w;
    output.x = -q.x;
    output.y = -q.y;
    output.z = -q.z;
    return output;
};

/**
 *
 *
 * @method normalize
 * @param {Quaternion} q The reference Quaternion.
 * @param {Quaternion} output Quaternion in which to place the result.
 * @return {Quaternion} The normalized Quaternion.
 */
Quaternion.normalize = function normalize(q, output) {
    var w = q.w;
    var x = q.x;
    var y = q.y;
    var z = q.z;

    var length = sqrt(w * w + x * z + y * y + z * z) || 1;
    length = 1 / length;

    output.w = w * length;
    output.x = x * length;
    output.y = y * length;
    output.z = z * length;
    return output;
};

/**
 * Clone the input Quaternion.
 *
 * @method clone
 * @param {Quaternion} q the reference Quaternion.
 * @return {Quaternion} The cloned Quaternion.
 */
Quaternion.clone = function clone(q) {
    return new Quaternion(q.w, q.x, q.y, q.z);
};

/**
 * Add the inputs Quaternions.
 *
 * @param {Quaternion} q1 The left Quaternion.
 * @param {Quaternion} q2 The right Quaternion.
 * @param {Quaternion} output Quaternion in which to place the result.
 * @return {Quaternion} The sum.
 */
Quaternion.add = function add(q1, q2, output) {
    output.w = q1.w + q2.w;
    output.x = q1.x + q2.x;
    output.y = q1.y + q2.y;
    output.z = q1.z + q2.z;
    return output
};

/**
 * Subtract the inputs Quaternions.
 *
 * @param {Quaternion} q1 The left Quaternion.
 * @param {Quaternion} q2 The right Quaternion.
 * @param {Quaternion} output Quaternion in which to place the result.
 * @return {Quaternion} The difference.
 */
Quaternion.subtract = function subtract(q1, q2, output) {
    output.w = q1.w - q2.w;
    output.x = q1.x - q2.x;
    output.y = q1.y - q2.y;
    output.z = q1.z - q2.z;
    return output
};

/**
 * Scale the input Quaternion by a scalar.
 *
 * @param {Quaternion} q The reference Quaternion.
 * @param {Number} s The Number by which to scale.
 * @param {Quaternion} output Quaternion in which to place the result.
 * @return {Quaternion} The scaled Quaternion.
 */
Quaternion.scale = function scale(q, s, output) {
    output.w = q.w * s;
    output.x = q.x * s;
    output.y = q.y * s;
    output.z = q.z * s;
    return output;
};

/**
 * The dot product of the two input Quaternions.
 *
 * @method dotProduct
 * @param {Quaternion} q1 The left Quaternion.
 * @param {Quaternion} q2 The right Quaternion.
 * @return {Number} The dot product of the two Quaternions.
 */
Quaternion.dot = function dot(q1, q2) {
    return q1.w * q2.w + q1.x * q2.x + q1.y * q2.y + q1.z * q2.z;
};

module.exports = Quaternion;
