#pragma glslify: convertToClipSpace = require(./chunks/convertToClipSpace)
#pragma glslify: getNormalMatrix = require(./chunks/getNormalMatrix)
#pragma glslify: invertYAxis = require(./chunks/invertYAxis)
#pragma glslify: inverse = require(./chunks/inverse)
#pragma glslify: transpose = require(./chunks/transpose)

vec4 applyTransform(vec4 pos) {
    mat4 projection = perspective;
    pos.y *= -1.0;
    pos.xyz *= size.xyz;
    mat4 MVMatrix = invertYAxis(transform);
    vec4 translation = convertToClipSpace(MVMatrix[3]);
    MVMatrix[3] = vec4(0.0, 0.0, 0.0, 1.0);
    projection[0][0] = 1.0/resolution.x;
    projection[1][1] = 1.0/resolution.y;
    projection[2][2] = (resolution.y > resolution.x) ? 1.0/resolution.y : 1.0/resolution.x;

    pos = MVMatrix * pos;

    vPosition = pos.xyz;
    vPosition += translation.xyz;

    pos = projection * pos;
    pos += translation;

    return pos;
}

// Main function of the vertex shader.  Passes texture coordinat
// and normal attributes as varyings and passes the position
// attribute through position pipeline
void main() {
    gl_PointSize = 10.0;
    vNormal = transpose(mat3(inverse(transform))) * normals;
    vTextureCoordinate = texCoord;
    gl_Position = applyTransform(vec4(pos, 1.0));
}
