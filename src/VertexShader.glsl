const mat4 inverseMat = mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, -1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
);

vec4 clipspace(vec4 pos) { 
    return vec4( 
        ( (2.0 * pos.x) - resolution.x + size.x ) / resolution.x,
        ( (2.0 * pos.y) + resolution.y - size.y ) / resolution.y,
        pos.z,
       0.0
    );
}

vec4 applyTransform(vec4 pos) {
   mat4 projection = perspective;
   pos.y *= -1.0;
   pos.xyz *= size.xyz;
   mat4 MVMatrix = inverseMat * transform;
   vec4 translation = clipspace(MVMatrix[3]);
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
    gl_PointSize = 10.;
    vNormal = normals;
    vTextureCoordinate = texCoord;
    gl_Position = applyTransform(vec4(pos, 1.0));
}