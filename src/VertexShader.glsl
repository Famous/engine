#pragma glslify: convertToClipSpace = require(./chunks/convertToClipSpace)
#pragma glslify: getNormalMatrix = require(./chunks/getNormalMatrix)
#pragma glslify: invertYAxis = require(./chunks/invertYAxis)
#pragma glslify: inverse = require(./chunks/inverse)
#pragma glslify: transpose = require(./chunks/transpose)

vec4 applyTransform(vec4 pos) {
   float xOrigin = (origin.x - 0.5) * size.x;
   float yOrigin = (origin.y - 0.5) * size.y;
   float zOrigin = (origin.z - 0.5) * size.z;

   mat4 forwardOrigin = mat4(1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, xOrigin, yOrigin, zOrigin, 1.0);
   mat4 negatedOrigin = mat4(1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, -xOrigin, -yOrigin, -zOrigin, 1.0);

   mat4 originMVMatrix = forwardOrigin * transform;
   originMVMatrix = transform * negatedOrigin;

   mat4 projection = perspective;
   mat4 MVMatrix = invertYAxis(originMVMatrix);
   MVMatrix[3][2] *= 2.0;
   vec4 translation = MVMatrix[3];
   
   pos.xyz *= size;
   pos.y *= -1.0;
   vec4 pixelPosition = vec4(pos.x * 0.5, pos.y * 0.5, pos.z * 0.5, 1.0);
   mat4 pixelTransform = originMVMatrix;
   pixelTransform[3][0] += size.x * 0.5;
   pixelTransform[3][1] += size.y * 0.5;

   projection[0][0] = 1.0/resolution.x;
   projection[1][1] = 1.0/resolution.y;
   projection[2][2] = (resolution.y > resolution.x) ? -1.0/resolution.y : -1.0/resolution.x;
   projection[2][3] *= 0.5;

   vPosition = (pixelTransform * pixelPosition).xyz;

   mat4 MVPMatrix = projection * MVMatrix;
   MVPMatrix[3] = vec4(0.0, 0.0, 0.0, MVPMatrix[3][3]);

   pos = MVPMatrix * pos;

   pos += convertToClipSpace(translation);

   return pos;
}

// Main function of the vertex shader.  Passes texture coordinat
// and normal attributes as varyings and passes the position
// attribute through position pipeline
void main() {
   gl_PointSize = 10.0;
   vec3 invertedNormals = normals;
   invertedNormals.y *= -1.0;
   vNormal = transpose(mat3(inverse(transform))) * invertedNormals;
   vTextureCoordinate = texCoord;
   gl_Position = applyTransform(vec4(pos, 1.0));
}
