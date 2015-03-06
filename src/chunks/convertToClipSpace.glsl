vec4 convertToClipSpace(vec4 pos) {
	float zTranslationScale = (resolution.x > resolution.y) ? 1.0/resolution.x : 1.0/resolution.y;
    return vec4(
        ( (2.0 * pos.x) - resolution.x + (2.0 * origin.x * size.x) ) / resolution.x,
        ( (2.0 * pos.y) + resolution.y - (2.0 * origin.y * size.y) ) / resolution.y,
        -pos.z * zTranslationScale,
       0.0
    );
}

#pragma glslify: export(convertToClipSpace)
