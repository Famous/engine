mat4 inverseYMatrix = mat4(
        1.0, 0.0, 0.0, 0.0,
        0.0, -1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
);

mat4 invertYAxis(mat4 transform) {
    return inverseYMatrix * transform;
}

#pragma glslify: export(invertYAxis)
