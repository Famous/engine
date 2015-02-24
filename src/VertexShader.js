'use strict';

module.exports = {
    glsl: [
        // Constant inverse matrix value used in projection multiplication.
        'const mat4 inverseMat = mat4(',
        '    1.0, 0.0, 0.0, 0.0,',
        '    0.0, -1.0, 0.0, 0.0,',
        '    0.0, 0.0, 1.0, 0.0,',
        '    0.0, 0.0, 0.0, 1.0',
        ');',

        'vec4 clipspace(in vec4 pos) {' +
        '    return vec4(' +
        '        ( ( (2.0 * pos.x) - resolution.x + size.x ) / resolution.x ) * (resolution.x/resolution.y),',
        '        ( (2.0 * pos.y) + resolution.y - size.y ) / resolution.y,',
        '        pos.z,',
        '       1.0',
        '    );',
        '}',
        
        'vec4 applyTransform(in vec4 pos) {',
        '   mat4 projection = perspective;',
        '   float width = size.x/resolution.y;',
        '   float height = size.y/resolution.y;',
        '   pos.xy *= vec2(width, height);',
        '   projection[0][0] = 1.0/(resolution.x/resolution.y);',
        '   pos.y *= -1.0;',
        '   mat4 MVMatrix = inverseMat * transform;',
        '   MVMatrix[3] = clipspace(MVMatrix[3]);',
        '   pos = perspective * MVMatrix * pos;',
        '   return pos;',
        '}',
        
        // Main function of the vertex shader.  Passes texture coordinate
        // and normal attributes as varyings and passes the position 
        // attribute through position pipeline.

        'void main() {',
        '    vPosition = pos.xyz;',
        '    gl_Position = applyTransform(vec4(pos, 1.0));',
        '}'
    ].join('\n')
};