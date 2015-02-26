#pragma glslify: lambertianLight = require(./chunks/lambertianLight)

void main() {
    vec3 color = lambertianLight(baseColor, vPosition, vNormal, u_LightPosition, u_LightColor);
    gl_FragColor = vec4(color, opacity);
}
