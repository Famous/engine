/**
 * Reflects a matrix over its main diagonal.
 * 
 * @method transpose
 * @private
 *
 *
 */


float transpose(float m) {
    return m;
}

mat2 transpose(mat2 m) {
    return mat2(m[0][0], m[1][0],
                m[0][1], m[1][1]);
}

mat3 transpose(mat3 m) {
    return mat3(m[0][0], m[1][0], m[2][0],
                m[0][1], m[1][1], m[2][1],
                m[0][2], m[1][2], m[2][2]);
}

mat4 transpose(mat4 m) {
    return mat4(m[0][0], m[1][0], m[2][0], m[3][0],
                m[0][1], m[1][1], m[2][1], m[3][1],
                m[0][2], m[1][2], m[2][2], m[3][2],
                m[0][3], m[1][3], m[2][3], m[3][3]);
}

#pragma glslify: export(transpose)
