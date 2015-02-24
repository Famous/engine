//the strength of reflections on a surface is dependent on the viewing angle
//The amount of reflection increases on surfaces viewed at a glancing angle
float fresnel(float f0, vec3 n, vec3 l){
  return f0 + (1.0-f0) * pow(1.0- dot(n, l), 5.0);
}
//normalizes diffuse light so that spec+diffuse is not greater than 1 (object can only reflect as much light as is shone upon it
float diffuseEnergyRatio(float f0, vec3 n, vec3 l){
  return 1.0 - fresnel(f0, n, l);
}
//gives the absolute magnitude of the reflectanc
float distribution(vec3 n, vec3 h, float roughness){
  float m= 2.0/(roughness*roughness) - 2.0;
  return (m+2.0) * pow( max(dot(n, h), 0.0), m) / (2.0 * 3.14159265);
}
//computes the specular lobe using the half-angle vecto
//by estimating how much is the microfacet is blocked by other microfacet
float geometry(vec3 n, vec3 h, vec3 v, vec3 l, float roughness){
  float NdotL_clamped= max(dot(n, l), 0.0);
  float NdotV_clamped= max(dot(n, v), 0.0);
  float k= roughness * sqrt(2.0/3.14159265);
  float one_minus_k = 1.0 -k;
  return ( NdotL_clamped / (NdotL_clamped * one_minus_k + k) ) * ( NdotV_clamped / (NdotV_clamped * one_minus_k + k) );
}
vec3 applyLight(vec3 baseColor, vec3 normal, float metalness, float glossiness) {
  vec3 light = vec3(.5, .1, .5);
  vec3 color = baseColor * dot(normal, light);
  vec3 view = -normalize(vPosition);
  vec3 halfVec = normalize(light + view);
  float NdotL = dot(normal, light);
  float NdotV = dot(normal, view);
  float NdotL_clamped = max(NdotL, 0.0);
  float NdotV_clamped = max(NdotV, 0.0);
  float brdf_spec = fresnel(metalness, halfVec, light) * geometry(normal, halfVec, view, light, glossiness) * distribution(normal, halfVec, glossiness) / (4.0 * NdotL_clamped * NdotV_clamped);
  vec3 color_spec = NdotL_clamped * brdf_spec * color;
  vec3 color_diff = NdotL_clamped * diffuseEnergyRatio(metalness, normal, light) * color;
  return color_diff * .3;
}
//float_definitions
float applyMaterial(float ID) {
  //float_applications
  return 1.;
}
//vec_definitions
vec3 applyMaterial(vec3 ID) {
  //vec_applications
  return vec3(1);
}
void main() {
    gl_FragColor.rgb = applyLight(
    baseColor.x >= 0. ? baseColor : applyMaterial(baseColor),
    normal.x >= 0. ? vNormal : (vNormal + applyMaterial(normal)),
    metalness >= 0. ? metalness: applyMaterial(metalness),
    glossiness >= 0. ? glossiness: applyMaterial(glossiness));
    gl_FragColor.a = opacity;
    gl_FragColor = vec4((vPosition + 1.0) * 0.5, 1.0);
}
