/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var test = require('tape');
var Program = require('../Program');
var WebGLTestingContext = require('./helpers/ContextWebGL');

var time = 0;
var program;

/*
 * Helper for creating a function
 */
function createProgram() {
    return new Program(new WebGLTestingContext());
}

test('Program', function(t) {

    t.test('Time setup', function(t) {
        time = 0;

        Date.now = function() {
            return time;
        };

        t.equal(typeof Date.now, 'function',
            'should be a function');

        time = 50;
        t.equal(Date.now(), 50,
            'should manipulate current time for testing');

        time = 0;
        t.equal(Date.now(), 0,
            'should be able to set time to 0');

        t.end();
    });

    t.test('Program constructor', function(t) {

        t.equal(typeof Program, 'function',
            'should be a function');

        t.throws(function() {
            program = new Program();
        }, 'should throw an error if GL context is not provided');

        t.end();
    });

    t.test('Program.prototype.registerMaterial', function(t) {
        program = createProgram();

        t.equal(typeof program.registerMaterial, 'function',
            'should be a function');

        t.false(~program.uniformNames.indexOf('u_Amplitude'),
            'should not have custom uniform names');

        t.false(~program.attributeNames.indexOf('a_Displacement'),
            'should not have custom attribute names');

        t.false(~program.varyingNames.indexOf('v_Displacement'),
            'should not have custom varying names');

        // Custom material
        var name = 'positionOffset';
        var material = {
            _id: 1,
            glsl: 'return vec3 fa_1=normalsDisplacement();',
            defines: 'vec3 normalsDisplacement() { return normals; }',
            uniforms: { u_Amplitude: 1 },
            varyings: { v_Displacement: 1 },
            attributes: { a_Displacement: 1 }
        };
        program.registerMaterial(name, material);

        var uniformIndex = program.uniformNames.indexOf('u_Amplitude');
        t.true(~uniformIndex,
            'should have custom uniform names');

        t.equal(program.uniformValues[uniformIndex], 1,
            'should have custom uniform values');

        var attributeIndex = program.attributeNames.indexOf('a_Displacement');
        t.true(~attributeIndex,
            'should have custom attribute names');

        t.equal(program.attributeValues[attributeIndex], 1,
            'should have custom attribute values');

        var varyingIndex = program.varyingNames.indexOf('v_Displacement');
        t.true(~varyingIndex,
            'should have custom varying names');

        t.equal(program.varyingValues[varyingIndex], 1,
            'should have custom varying values');

        t.end();
    });

    t.test('Program.prototype.resetProgram', function(t) {
        program = createProgram();

        t.equal(typeof program.resetProgram, 'function',
            'should be a function');

        t.true(program.uniformNames.length,
            'should populate uniforms names');

        t.true(program.uniformValues.length,
            'should populate uniforms values');

        t.true(program.attributeNames.length,
            'should populate attributes names');

        t.true(program.attributeValues.length,
            'should populate attributes values');

        t.true(program.varyingNames.length,
            'should populate varyings names');

        t.true(program.varyingValues.length,
            'should populate varyings values');

        t.end();
    });

    t.test('Program.prototype.uniformIsCached', function(t) {
        program = createProgram();

        t.equal(typeof program.uniformIsCached, 'function',
            'should be a function');

        t.false(program.uniformIsCached('randomUniform', [0, 0, 0]),
            'should return false if uniform has not been cached');

        t.true(program.uniformIsCached('randomUniform', [0, 0, 0]),
            'should return true if uniform has been cached');

        t.end();
    });

    t.test('Program.prototype.setUniforms', function(t) {
        program = createProgram();

        t.equal(typeof program.setUniforms, 'function',
            'should be a function');

        t.throws(program.setUniforms(['invalidUniform'], [0, 0, 0, 0]),
            'throws an error if provided with an invalid uniform');

        t.true(program.setUniforms(['validUniform'], [[1, 1, 1]]),
            'set uniform if provided with a valid input');

        t.end();
    });

    t.test('Program.prototype.compileShader', function(t) {
        program = createProgram();

        t.equal(typeof program.compileShader, 'function',
            'should be a function');

        t.true(program.compileShader({}, 'void main(){}'),
            'should compile given the shader source');

        t.end();
    });
    t.end();
});
