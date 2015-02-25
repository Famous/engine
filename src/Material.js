'use strict';

var STRING = 'string';

var chunks = {
    abs: {glsl: 'abs(%1);', inputs: [0], output: 0 },
    sign: {glsl: 'sign(%1);', inputs: [0], output: 0 },
    floor: {glsl: 'floor(%1);', inputs: [0], output: 0 },
    ceiling: {glsl: 'ceil(%1);', inputs: [0], output: 0 },
    
    mod: {glsl: 'mod(%1, %2);', inputs: [1], output: 1 },
    min: {glsl: 'min(%1, %2);', inputs: [1], output: 1 },
    max: {glsl: 'max(%1, %2);', inputs: [1], output: 1 },
    clamp: {glsl: 'clamp(%1, %2, %3);', inputs: [1], output: 1 },
    mix: {glsl: 'mix(%1, %2, %3);', inputs: [1], output: 1 },
    step: {glsl: 'step(%1, %2, %3);', inputs: [1], output: 1 },
    smoothstep: {glsl: 'smoothstep(%1);', inputs: [1], output: 1 },

    sine: {glsl: 'sin(time);', inputs: [1], output: 1 },
    time: {glsl: 'time;', inputs: [], output: 1 },

    add: {glsl: '%1 + %2;', inputs: [4, 4], output: 4, content: '+' }, 
    multiply: {glsl: '%1 * %2;', inputs: [4, 4], output: 4, content: '+' }, 

    normal: {glsl:'vNormal;', inputs: [], output: 4 },
    uv: {glsl:'vec3(vTextureCoordinate, 1);', inputs: [], output: 4 },
    meshPosition: {glsl:'(vPosition + 1.0) * 0.5;', inputs: [], output: 4 },

    image: {glsl:'texture2D(image, vTextureCoordinate).rgb;', inputs: [], output: 4 },

    constant: {glsl: 'vec3(.5,1,1);', inputs: [], output: 4 }, 
    parameter: {uniforms: {parameter: 1}, glsl: 'parameter;', inputs: [], output: 4 }, 

    filter: {glsl: '%1 * vec3(1,0,1);', inputs: [4], output: 4 },
    panner: {glsl: '%1 + vec3(0, sin(time * .01), 1,1);', inputs: [4], output: 4 }
};

var expressions = {};

expressions.registerExpression = function registerExpression(name, schema) {
    this[name] = function (inputs, uniforms) {
        return new Material(name, schema, inputs, uniforms);
    };
};

for (var name in chunks) {
    expressions.registerExpression(name, chunks[name]);
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

function Material(name, chunk, inputs, uniforms) {
    this.name = name;
    this.chunk = chunk;
    this.inputs = inputs ? (Array.isArray(inputs) ? inputs : [inputs]): [];
    this.uniforms = uniforms;
    this._id = Material.id++;
    for (var k in uniforms) if (STRING === typeof uniforms[k]) uniforms[k] = loadImage(uniforms[k]);
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
 
   this.traverse(function (node, depth) {
        if (! node.chunk) return;
        glsl += 'vec3 ' + makeLabel(node._id) + '=' + processGLSL(node.chunk.glsl, node.inputs) + '\n ';
        if (node.uniforms) extend(uniforms, node.uniforms);
    });

    return {
        _id: this._id,
        glsl: glsl + 'return ' + makeLabel(this._id) + ';',
        uniforms: uniforms
    };
};

function extend (a, b) { for (var k in b) a[k] = b[k]; }

function processGLSL(str, inputs) {
    return str.replace(/%\d/g, function (s) {
        return makeLabel(inputs[s[1]-1]._id);
    });
}
function makeLabel (n) {
    return 'fa_' + (n);
}

function loadImage (url) {
    var img = new Image();
    img.src = url;
    return img;
}

module.exports = expressions;
