#pragma glslify: convertToClipSpace = require(./chunks/convertToClipSpace)
#pragma glslify: getNormalMatrix = require(./chunks/getNormalMatrix)
#pragma glslify: invertYAxis = require(./chunks/invertYAxis)
#pragma glslify: inverse = require(./chunks/inverse)
#pragma glslify: transpose = require(./chunks/transpose)

vec4 applyTransform(vec4 pos) {
    pos.x += 1.0;
    pos.y -= 1.0;

    mat4 MVMatrix = view * transform;

    mat4 projection = perspective;
    mat4 invertedYMatrix = invertYAxis(MVMatrix);
    vec4 translation = invertedYMatrix[3];

    pos.xyz *= size * 0.5;
    pos.y *= -1.0;

    projection[0][0] = 1.0/(resolution.x * 0.5);
    projection[1][1] = 1.0/(resolution.y * 0.5);
    projection[2][2] = (resolution.y > resolution.x) ? -1.0/(resolution.y * 0.5) : -1.0/(resolution.x * 0.5);

    v_Position = (MVMatrix * pos).xyz;

    mat4 MVPMatrix = projection * invertedYMatrix;
    MVPMatrix[3] = vec4(0.0, 0.0, 0.0, MVPMatrix[3][3]);

    pos = MVPMatrix * pos;

    pos += convertToClipSpace(translation);

    return pos;
}

#vert_definitions
vec3 calculateOffset(vec3 ID) {
    #vert_applications
    return vec3(0.0);
}

// Main function of the vertex shader.  Passes texture coordinate
// and normal attributes as varyings and passes the position
// attribute through position pipeline
void main() {
    gl_PointSize = 10.0;
    vec3 invertedNormals = normals;
    invertedNormals.y *= -1.0;
    v_Normal = transpose(mat3(inverse(transform))) * invertedNormals;
    v_TextureCoordinate = texCoord;
    vec3 offsetPos = pos + calculateOffset(positionOffset);
    gl_Position = applyTransform(vec4(offsetPos, 1.0));
}
