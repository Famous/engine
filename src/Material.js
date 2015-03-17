'use strict';

var TextureRegistry = require('./TextureRegistry');

/** 
 * A list of glsl expressions which can interface with javascript data and
 * connected to each other to build custom shaders. 
 *
 */
var expressions = {};

var snippets = {

    /* Abs - The abs function returns the absolute value of x, i.e. x when x is positive or zero and -x for negative x. The input parameter can be a floating scalar or a float vector. In case of a float vector the operation is done component-wise.
     */ 

    abs: {glsl: 'abs(%1);'},
    /* Sign - The sign function returns 1.0 when x is positive, 0.0 when x is zero and -1.0 when x is negative. The input parameter can be a floating scalar or a float vector. In case of a float vector the operation is done component-wise. */


    sign: {glsl: 'sign(%1);'},

    /* Floor - The floor function returns the largest integer number that is smaller or equal to x. The input parameter can be a floating scalar or a float vector. In case of a float vector the operation is done component-wise. */

    floor: {glsl: 'floor(%1);'},

    /* Ceiling - The ceiling function returns the smallest number that is larger or equal to x. The input parameter can be a floating scalar or a float vector. In case of a float vector the operation is done component-wise. */

    ceiling: {glsl: 'ceil(%1);'},

    /* The mod expression returns the remained of the division operation of the two inputs. */
    mod: {glsl: 'mod(%1, %2);'},

    /* Min - The min function returns the smaller of the two arguments. The input parameters can be floating scalars or float vectors. In case of float vectors the operation is done component-wise. */

    min: {glsl: 'min(%1, %2);'},

    /* Max - The max function returns the larger of the two arguments. The input parameters can be floating scalars or float vectors. In case of float vectors the operation is done component-wise. */ 

    max: {glsl: 'max(%1, %2);'},
    /* Clamp - The clamp function returns x if it is larger than minVal and smaller than maxVal. In case x is smaller than minVal, minVal is returned. If x is larger than maxVal, maxVal is returned. The input parameters can be floating scalars or float vectors. In case of float vectors the operation is done component-wise. */

    clamp: {glsl: 'clamp(%1, %2, %3);'},

    /* Mix - The mix function returns the linear blend of x and y, i.e. the product of x and (1 - a) plus the product of y and a. The input parameters can be floating scalars or float vectors. In case of float vectors the operation is done component-wise. */

    mix: {glsl: 'mix(%1, %2, %3);'},

    /* Step - The step function returns 0.0 if x is smaller then edge and otherwise 1.0. The input parameters can be floating scalars or float vectors. In case of float vectors the operation is done component-wise. */

    step: {glsl: 'step(%1, %2, %3);'},
    
    /* Smoothstep - The smoothstep function returns 0.0 if x is smaller then edge0 and 1.0 if x is larger than edge1. Otherwise the return value is interpolated between 0.0 and 1.0 using Hermite polynomirals. The input parameters can be floating scalars or float vectors. In case of float vectors the operation is done component-wise. */ 

    smoothstep: {glsl: 'smoothstep(%1);'},


    /* fragCoord - The fragCoord function returns the fragment's position in screenspace. */

    fragCoord: {glsl: 'gl_FragColor.xy;'},

    /* Sin - The sin function returns the sine of an angle in radians. The input parameter can be a floating scalar or a float vector. In case of a float vector the sine is calculated separately for every component. */


    sin: {glsl: 'sin(%1);'},

    /* Cos - The cos function returns the cosine of an angle in radians. The input parameter can be a floating scalar or a float vector. */

    cos: {glsl: 'cos(%1);'},

    /* Pow - The power function returns x raised to the power of y. The input parameters can be floating scalars or float vectors. In case of float vectors the operation is done component-wise. */ 

    pow: {glsl: 'pow(%1, %2);'},

    /* Sqrt - The sqrt function returns the square root of x. The input parameter can be a floating scalar or a float vector. In case of a float vector the operation is done component-wise. */ 

    /* fragCoord - The time function returns the elapsed time in the unix epoch in milliseconds.*/

    time: {glsl: 'time;'},

    /* The Add function takes two inputs, adds them together and outputs the result. This addition operation is performed on a per channel basis, meaning that the inputs' R channels get added, G channels get added, B channels get added, etc. Both inputs must have the same number of channels unless one of them is a single Constant value. Constants can be added to a vector with any number of inputs. */
    add: {glsl: '%1 + %2;'},

    /* The Add function takes two inputs, adds them together and outputs the result. This addition operation is performed on a per channel basis, meaning that the inputs' R channels get added, G channels get added, B channels get added, etc. Both inputs must have the same number of channels unless one of them is a single Constant value. Constants can be added to a vector with any number of inputs. */
    multiply: {glsl: '%1 * %2;'},


    /* The normal function returns the 3-dimensional surface normal, which is a vector that is perpendicular to the tangent plane at that point.*/
    normal: {glsl:'(v_Normal + 1.0) * 0.5;'},

    /* The uv function returns the 2-dimensional vector that maps the object's 3-dimensional vertices to a 2D plane. */
    uv: {glsl:'vec3(v_TextureCoordinate, 1);'},

    /* The mesh position function returns the transformed fragment's position in world-space.  */
    meshPosition: {glsl:'(v_Position + 1.0) * 0.5;'},


    /* The image function fetches the model's */
    image: {glsl:'texture2D(image, v_TextureCoordinate).rgb;'},


    /* The constant function returns a static value which is defined at compile-time that cannot be changed dynamically.*/
    constant: {glsl: '%1;'},
    
    /* The Parameter expression has values that can be modified (dynamically during runtime in some cases) in a MaterialInstance of the base material containing the parameter. These expressions should be given unique names, via the Parameter Name property, to be used when identifying the specific parameter in the MaterialInstance. If two parameters of the same type have the same name in the same material, they will be assumed to be the same parameter. Changing the value of the parameter in the MaterialInstance would change the value of both the parameter expressions in the material. A default value for the parameter will also be set in the base material. This will be the value of the parameter in the MaterialInstance unless it is overridden and modified there. */

    parameter: {uniforms: {parameter: 1}, glsl: 'parameter;'}
};

expressions.registerExpression = function registerExpression(name, schema) {
    this[name] = function (inputs, options) {
        return new Material(name, schema, inputs, options);
    };
};

for (var name in snippets) {
    expressions.registerExpression(name, snippets[name]);
}

/**
 * Material is a public class that composes a material-graph out of expressions
 *
 *
 * @class Material
 * @constructor
 *
 * @param {Object} definiton of nascent expression with shader code, inputs and uniforms
 * @param {Array} list of Material expressions, images, or constant
 * @param {Object} map of uniform data of float, vec2, vec3, vec4
 */

function Material(name, chunk, inputs, options) {
    options = options || {};

    this.name = name;
    this.chunk = chunk;
    this.inputs = inputs ? (Array.isArray(inputs) ? inputs : [inputs]): [];
    this.uniforms = options.uniforms || {};
    this.varyings = options.varyings;
    this.attributes = options.attributes;
    if (options.texture) {
        this.texture = options.texture.__isATexture__ ? options.texture : TextureRegistry.register(null, options.texture);
    }

    this._id = Material.id++;

    this.invalidations = [];
}

Material.id = 1;

/**
 * Iterates over material graph
 *
 * @method traverse
 * @chainable
 *
 * @param {Function} invoked upon every expression in the graph
 */

Material.prototype.traverse = function traverse(callback) {
    var len = this.inputs && this.inputs.length, idx = -1;

    while (++idx < len) traverse.call(this.inputs[idx], callback, idx);

    callback(this);

    return this;
};

Material.prototype.setUniform = function setUniform(name, value) {
    this.uniforms[name] = value;

    this.invalidations.push(name);
};

/**
 * Converts material graph into chunk
 *
 * @method _compile
 * @protected
 *
 */

Material.prototype._compile = function _compile() {
    var glsl = '';
    var uniforms = {};
    var varyings = {};
    var attributes = {};
    var defines = [];
    var texture;

    this.traverse(function (node, depth) {
        if (! node.chunk) return;
        glsl += 'vec3 ' + makeLabel(node) + '=' + processGLSL(node.chunk.glsl, node.inputs) + '\n ';
        if (node.uniforms) extend(uniforms, node.uniforms);
        if (node.varyings) extend(varyings, node.varyings);
        if (node.attributes) extend(attributes, node.attributes);
        if (node.chunk.defines) defines.push(node.chunk.defines);
        if (node.texture) texture = node.texture;
    });

    return {
        _id: this._id,
        glsl: glsl + 'return ' + makeLabel(this) + ';',
        defines: defines.join('\n'),
        uniforms: uniforms,
        varyings: varyings,
        attributes: attributes,
        texture: texture
    };
};

function extend (a, b) { for (var k in b) a[k] = b[k]; }

function processGLSL(str, inputs) {
    return str.replace(/%\d/g, function (s) {
        return makeLabel(inputs[s[1]-1]);
    });
}
function makeLabel (n) {
    if (Array.isArray(n)) return arrayToVec(n);
    if (typeof n == 'object') return 'fa_' + (n._id);
    else return JSON.stringify(n);
}

function arrayToVec(array) {
    var len = array.length;
    return 'vec' + len + '(' + array.join(',')  + ')';
}

module.exports = expressions;
expressions.Material = Material;
expressions.Texture = function (source) {
    if (typeof window === 'undefined') return console.error('Texture constructor cannot be run inside of a worker');
    return expressions.image([], { texture: source });
};
