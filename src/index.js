'use strict';

var glslify = require('glslify');

var shaders = glslify({
	sourceOnly: true,
	vertex: './VertexShader.glsl',
	fragment: './FragmentShader.glsl'
});

module.exports = shaders;