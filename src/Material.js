'use strict';

var TextureRegistry = require('./TextureRegistry');

var snippets = {
    abs: {glsl: 'abs(%1);'},
    sign: {glsl: 'sign(%1);'},
    floor: {glsl: 'floor(%1);'},
    ceiling: {glsl: 'ceil(%1);'},

    mod: {glsl: 'mod(%1, %2);'},
    min: {glsl: 'min(%1, %2);'},
    max: {glsl: 'max(%1, %2);'},
    clamp: {glsl: 'clamp(%1, %2, %3);'},
    mix: {glsl: 'mix(%1, %2, %3);'},
    step: {glsl: 'step(%1, %2, %3);'},
    smoothstep: {glsl: 'smoothstep(%1);'},

    fragCoord: {glsl: 'gl_FragColor.xy;'},

    sin: {glsl: 'sin(%1);'},
    time: {glsl: 'time;'},

    add: {glsl: '%1 + %2;'},
    multiply: {glsl: '%1 * %2;'},

    normal: {glsl:'v_Normal;'},
    uv: {glsl:'vec3(v_TextureCoordinate, 1);'},
    meshPosition: {glsl:'(v_Position + 1.0) * 0.5;'},

    image: {glsl:'texture2D(image, v_TextureCoordinate).rgb;'},

    constant: {glsl: '%1;'},
    parameter: {uniforms: {parameter: 1}, glsl: 'parameter;'}
};

var expressions = {};

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
    if (! window) return console.log('this constructor cannot be run inside of a work');
    return expressions.image([], { texture: source });
};
