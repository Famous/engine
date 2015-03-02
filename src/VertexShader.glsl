#pragma glslify: convertToClipSpace = require(./chunks/convertToClipSpace)
#pragma glslify: getNormalMatrix = require(./chunks/getNormalMatrix)
#pragma glslify: invertYAxis = require(./chunks/invertYAxis)
#pragma glslify: inverse = require(./chunks/inverse)
#pragma glslify: transpose = require(./chunks/transpose)

vec4 applyTransform(vec4 pos) {
    mat4 projection = perspective;
    mat4 MVMatrix = invertYAxis(transform);
    vec4 translation = MVMatrix[3];
    MVMatrix[3] = vec4(0.0, 0.0, 0.0, 1.0);
    
    pos.xyz *= size.xyz;
    pos.y *= -1.0;
    vec4 pixelPosition = vec4(pos.x * 0.5, pos.y * 0.5, pos.z, 1.0);
    pixelPosition += vec4(size.x * 0.5, size.y * 0.5, 0.0, 0.0);

    projection[0][0] = 1.0/resolution.x;
    projection[1][1] = 1.0/resolution.y;
    projection[2][2] = (resolution.y > resolution.x) ? -1.0/resolution.y : -1.0/resolution.x;


    vPosition = (transform * pixelPosition).xyz;

    pos = projection * MVMatrix * pos;

    pos += convertToClipSpace(translation);

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
