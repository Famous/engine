vec4 convertToClipSpace(vec4 pos) {
    return vec4(
        ( (2.0 * pos.x) - resolution.x + size.x ) / resolution.x,
        ( (2.0 * pos.y) + resolution.y - size.y ) / resolution.y,
        pos.z,
       0.0
    );
}

#pragma glslify: export(convertToClipSpace)
