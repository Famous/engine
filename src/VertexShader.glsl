#pragma glslify: getNormalMatrix = require(./chunks/getNormalMatrix)
#pragma glslify: inverse = require(./chunks/inverse)
#pragma glslify: transpose = require(./chunks/transpose)

vec4 applyTransform(vec4 pos) {
    mat4 MVMatrix = view * transform;

    pos.x += 1.0;
    pos.y -= 1.0;
    pos.xyz *= size * 0.5;
    pos.y *= -1.0;

    MVMatrix[0][1] *= -1.0;
    MVMatrix[1][1] *= -1.0;
    MVMatrix[2][1] *= -1.0;
    MVMatrix[3][1] *= -1.0;

    mat4 MVPMatrix = perspective * MVMatrix;

    v_Position = (MVMatrix * pos).xyz;
    pos = MVPMatrix * pos;

    pos.x /= (resolution.x * 0.5);
    pos.y /= (resolution.y * 0.5);
    pos.x -= 1.0;
    pos.y += 1.0;
    pos.z *= -0.00001;

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
