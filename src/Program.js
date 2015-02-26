'use strict';

var Utility = require('famous-utilities');
var Texture = require('./Texture');

/* Cached values */

var INDICES = 'indices';
var FLOAT = 'float';
var VEC = 'vec';
var MAT = 'mat';
var UNIFORM = 'uniform ';
var NEWLINE = '\n';
var SEMINEWLINE = ';\n';
var ATTRIBUTE = 'attribute ';
var VARYING = 'varying ';

var checkers = require('./Checkerboard');

var TYPES = {
    undefined: 'float ',
    1: 'float ',
    2: 'vec2 ',
    3: 'vec3 ',
    4: 'vec4 ',
    16: 'mat4 '
};

var VERTEX_SHADER = 35633;
var FRAGMENT_SHADER = 35632;

var vertexWrapper = require('famous-webgl-shaders').vertex;

var fragmentWrapper = require('famous-webgl-shaders').fragment;

var inputs = ['baseColor', 'normals', 'metalness', 'glossiness'];
var inputTypes = {baseColor: 'vec3', normal: 'vec3', glossiness: 'float', metalness: 'float' };

/* Default values used in the every shader instance */
var identityMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

var uniformNames = [
    'perspective', 'resolution',
    'transform', 'origin', 'size', 'opacity',
    'baseColor', 'normal', 'metalness', 'glossiness',
    'u_LightPosition', 'u_LightColor'
];

var uniformValues = [
    identityMatrix, [0, 0, 0],
    identityMatrix, [0.5, 0.5], [1, 1, 1], 0,
    [1, 1, 1], [1, 1, 1], 1, 1,
    [1, 1, 1], [1, 1, 1]
];

var attributeNames = ['pos', 'texCoord', 'normals'];
var attributeValues = [3, 2, 3];

var varyingNames = ['vTextureCoordinate', 'vNormal', 'vPosition'];
var varyingValues = [2, 3, 3];

var header = 'precision mediump float;\n';

/**
 * A class that handles interactions with the WebGL shader program
 * used by a specific context.  It manages creation of the shader program
 * and the attached vertex and fragment shaders.  It is also in charge of
 * passing all uniforms to the WebGLContext.
 *
 * @class Program
 * @constructor
 *
 * @param {WebGL Context} gl Context to be used to create the shader program.
 */

function Program(gl) {
    this.gl = gl;
    this.textureSlots = 1;

    this.registeredMaterials = {};
    this.flaggedUniforms = [];
    this.cachedUniforms  = {};

    this.definitionVec = [];
    this.definitionFloat = [];
    this.applicationVec = [];
    this.applicationFloat = [];

    this.resetProgram();
}

/**
 * Determines whether a material has already been registered to
 * the shader program.
 *
 * @method registerMaterial
 *
 * @param {Object} material Material being verified.
 */

Program.prototype.registerMaterial = function registerMaterial(name, material) {
    if (this.registeredMaterials[material._id]) return;
    this.registeredMaterials[material._id] = true;

    var compiled = material;

    if (compiled.uniforms.image) {
        var t = new Texture(this.gl);
        t.setImage(checkers);
        loadImage(compiled.uniforms.image, function (img) {
            t.setImage(img);
        });
        delete compiled.uniforms.image;
    }

    for (var k in compiled.uniforms) {
        uniformNames.push(k);
        uniformValues.push(compiled.uniforms[k]);
    }

    if (inputTypes[name] == FLOAT) {
        this.definitionFloat.push('float fa_' + material._id + '() {\n '  + compiled.glsl + ' \n}');
        this.applicationFloat.push('if (int(abs(ID)) == ' + material._id + ') return fa_' + material._id  + '();');
    } else {
        this.definitionVec.push('vec3 fa_' + material._id + '() {\n '  + compiled.glsl + ' \n}');
        this.applicationVec.push('if (int(abs(ID.x)) == ' + material._id + ') return fa_' + material._id + '();');
    }

    this.resetProgram();
};

/**
 * Clears all cached uniforms and attribute locations.  Assembles
 * new fragment and vertex shaders and based on material from
 * currently registered materials.  Attaches said shaders to new
 * shader program and upon success links program to the WebGL
 * context.
 *
 * @method resetProgram
 *
 * @return {Program} this
 *
 */

Program.prototype.resetProgram = function resetProgram() {
    var vsChunkDefines = [];
    var vsChunkApplies = [];
    var fsChunkDefines = [];
    var fsChunkApplies = [];

    var vertexHeader = [header];
    var fragmentHeader = [header];

    var fragmentSource;
    var vertexSource;
    var material;
    var program;
    var chunk;
    var name;
    var value;
    var i;

    this.uniformLocations   = [];
    this.attributeLocations = {};

    this.attributeNames = Utility.clone(attributeNames);
    this.attributeValues = Utility.clone(attributeValues);

    this.varyingNames = Utility.clone(varyingNames);
    this.varyingValues = Utility.clone(varyingValues);

    this.uniformNames = Utility.clone(uniformNames);
    this.uniformValues = Utility.clone(uniformValues);

    this.flaggedUniforms = [];
    this.cachedUniforms = {};

    fragmentHeader.push('uniform sampler2D image;\n');

    for(i = 0; i < this.uniformNames.length; i++) {
        name = this.uniformNames[i], value = this.uniformValues[i];
        vertexHeader.push(UNIFORM + TYPES[value.length] + name + SEMINEWLINE);
        fragmentHeader.push(UNIFORM + TYPES[value.length] + name + SEMINEWLINE);
    }

    for(i = 0; i < this.attributeNames.length; i++) {
        name = this.attributeNames[i], value = this.attributeValues[i];
        vertexHeader.push(ATTRIBUTE + TYPES[value] + name + SEMINEWLINE);
    }

    for(i = 0; i < this.varyingNames.length; i++) {
        name = this.varyingNames[i], value = this.varyingValues[i];
        vertexHeader.push(VARYING + TYPES[value]  + name + SEMINEWLINE);
        fragmentHeader.push(VARYING + TYPES[value] + name + SEMINEWLINE);
    }

    vertexSource = vertexHeader.join('') + vertexWrapper;

    fragmentSource = fragmentHeader.join('') + fragmentWrapper
        .replace('#vec_definitions', this.definitionVec.join(NEWLINE))
        .replace('#vec_applications', this.applicationVec.join(NEWLINE))
        .replace('#float_definitions', this.definitionFloat.join(NEWLINE))
        .replace('#float_applications', this.applicationFloat.join(NEWLINE));

    program = this.gl.createProgram();

    this.gl.attachShader(
        program,
        this.compileShader(this.gl.createShader(VERTEX_SHADER), vertexSource)
    );

    this.gl.attachShader(
        program,
        this.compileShader(this.gl.createShader(FRAGMENT_SHADER), fragmentSource)
    );

    this.gl.linkProgram(program);

    if (! this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
        console.error('link error: ' + this.gl.getProgramInfoLog(program));
        this.program = null;
    }
    else {
        this.program = program;
        this.gl.useProgram(this.program);
    }

    this.setUniforms(this.uniformNames, this.uniformValues);

    return this;
};

/**
 * Compares the value of the input uniform value against
 * the cached value stored on the Program class.  Updates and
 * creates new entries in the cache when necessary.
 *
 * @method uniformIsCached
 *
 * @param {String} targetName Key of uniform spec being evaluated
 * @param {Number | Array} value Value of uniform spec being evaluated
 * @return {Boolean} Value indicating whether the uniform being set
 * is cached.
 *
 */

Program.prototype.uniformIsCached = function (targetName, value) {
    if(this.cachedUniforms[targetName] == null) {
        if (Array.isArray(value)) {
            this.cachedUniforms[targetName] = value.slice();
        }
        else {
            this.cachedUniforms[targetName] = value;
        }
        return false;
    }
    else if (Array.isArray(value)){
        var i = value.length;
        while (i--) {
            if(value[i] !== this.cachedUniforms[targetName][i]) {
                i = value.length;
                while(i--) this.cachedUniforms[targetName][i] = value[i];
                return false;
            }
        }
    }

    else if (this.cachedUniforms[targetName] !== value) {
        this.cachedUniforms[targetName] = value;
        return false;
    }

    return true;
};

/**
 * Handles all passing of uniforms to WebGL drawing context.  This
 * function will find the uniform location and then, based on
 * a type inferred from the javascript value of the uniform, it will call
 * the appropriate function to pass the uniform to WebGL.  Finally,
 * setUniforms will iterate through the passed in shaderChunks (if any)
 * and set the appropriate uniforms to specify which chunks to use.
 *
 * @method setUniforms
 *
 * @param {Object} entityUniforms Key-value pairs of all uniforms from incoming spec
 * @param {Array} shaderChunks Program chunks registered to incoming spec
 * @return {Program} this
 *
 */

Program.prototype.setUniforms = function (uniformNames, uniformValue) {
    var gl = this.gl;
    var location;
    var value;
    var name;
    var flag;
    var len;
    var i;

    if (! this.program) return;

    len = uniformNames.length;
    for (i = 0; i < len; i++) {
        name = uniformNames[i];

        // Retreive the cached location of the uniform,
        // requesting a new location from the WebGL context
        // if it does not yet exist.

        location = this.uniformLocations[name] || gl.getUniformLocation(this.program, name);
        if (! location) continue;

        this.uniformLocations[name] = location;
        value = uniformValue[i];

        // Check if the value is already set for the
        // given uniform.

        // if (this.uniformIsCached(name, value)) continue;

        // Determine the correct function and pass the uniform
        // value to WebGL.
        if (Array.isArray(value) || value instanceof Float32Array) {
            switch (value.length) {
                case 4:  gl.uniform4fv(location, value); break;
                case 3:  gl.uniform3fv(location, value); break;
                case 2:  gl.uniform2fv(location, value); break;
                case 16: gl.uniformMatrix4fv(location, false, value); break;
                case 1:  gl.uniform1fv(location, value); break;
                case 9:  gl.uniformMatrix3fv(location, false, value); break;
                default: throw 'cant load uniform "' + name + '" with value:' + JSON.stringify(value);
            }
        }
        else if (! isNaN(parseFloat(value)) && isFinite(value)) {
            gl.uniform1f(location, value);
        }
        else {
            throw 'set uniform "' + name + '" to invalid type :' + value;
        }
    }
    return this;
};

/**
 * Adds shader source to shader and compiles the input shader.  Checks
 * compile status and logs error if necessary.
 *
 * @method compileShader
 *
 * @param {WebGL Program} shader Program to be compiled
 * @param {String} source Source to be used in the shader
 *
 * @return {WebGL Program} compiled shader
 */

Program.prototype.compileShader = function compileShader(shader, source) {
    var i = 1;

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        console.error('compile error: ' + this.gl.getShaderInfoLog(shader));
        console.error('1: ' + source.replace(/\n/g, function () { return '\n' + (i+=1) + ': '; }));
    }

    return shader;
};

function loadImage (img, callback) {
    var obj = (typeof img === 'string' ? new Image() : img) || {};
    obj.crossOrigin = 'anonymous';
    if (! obj.src) obj.src = img;
    if (! obj.complete) obj.onload = function () { callback(obj); };
    else callback(obj);

    return obj;
}

module.exports = Program;

