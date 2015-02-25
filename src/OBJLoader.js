var loadURL        = require('famous-utilities').loadURL;
var GeometryHelper = require('./GeometryHelper');

/*
 * A singleton object that takes that makes requests
 * for OBJ files and returns the formatted data as
 * an argument to a callback function.
 *
 * @static
 * @class Engine
 */

var OBJLoader = {
    cached: {},
    requests: {}
};

/*
 * Takes a path to desired obj file and makes an XMLHttp request
 * if the resource is not cached. Sets up the 'onresponse' function
 * as a callback for formatting and callback invocation.
 *
 * @method load
 *
 * @param {String} URL of desired obj
 * @param {Function} function to be fired upon successful formatting of obj
 * @param {Boolean} optional paramater specificing whether or not Famo.us should
 * calculate the normals for each face
 */

OBJLoader.load = function load(url, cb, computeNormals) {
    if (! this.cached[url]) {
        if(! this.requests[url]) {
            this.requests[url] = [cb];
            loadURL(
                url,
                _onsuccess.bind(
                    this,
                    url,
                    computeNormals
                )
            );
        } else {
            this.requests[url].push(cb);
        }
    } else {
        cb(this.cached[url]);
    }
};

/*
 * Fired on response from server for OBJ asset.  Formats the
 * returned string and stores the buffer data in cache.
 * Invokes all queued callbacks before clearing them.
 *
 * @method _onsuccess
 * @private
 *
 * @param {String} URL of requested obj
 * @param {Boolean} value determining whether or not to manually calculate normals
 * @param {String} content of the server response
 */

function _onsuccess(url, computeNormals, text) {
    var buffers = _format.call(this, text, computeNormals);
    this.cached[url] = buffers;

    for (var i = 0; i < this.requests[url].length; i++) {
        this.requests[url][i](buffers);
    }

    this.requests[url] = null;
};

/*
 * Takes raw string format of obj and converts it to a javascript
 * object representing the buffers needed to draw the geometry.
 *
 * @method _format
 * @private
 *
 * @param {String} raw obj data in text format
 * @param {Boolean} value determining whether or not to manually calculate normals
 *
 * @return {Object} vertex buffer data
 */

function _format(text, computeNormals) {
    var lines = text.split('\n');

    var faceTextureCoord = [];
    var vertexNormal = [];
    var textureCoord = [];
    var faceVertex = [];
    var faceNormal = [];
    var vertices = [];
    var scaleFactor = 1;
    var texcoord;
    var normal;
    var vertex;
    var index;
    var i1;
    var i2;
    var i3;
    var i4;
    var vx;
    var vy;
    var vz;
    var tx;
    var ty;
    var nx;
    var ny;
    var nz;
    var line;
    var length = lines.length;

    for(var i = 0; i < length; i++) {
        line = lines[i];

        //Vertex Positions
        if(line.indexOf('v ') !== -1) {
            vertex = line.split(' ');
            vx = parseFloat(vertex[1])*scaleFactor;
            vy = parseFloat(vertex[2])*scaleFactor;
            vz = parseFloat(vertex[3])*scaleFactor;
            vertices.push([vx, vy, vz]);
        }

        //Texture Coords
        else if(line.indexOf('vt ') !== -1) {
            texcoord = line.split(' ');
            tx = parseFloat(texcoord[1]);
            ty = parseFloat(texcoord[2]);
            textureCoord.push([tx, ty]);
        }

        //Vertex Normals
        else if(line.indexOf('vn ') !== -1) {
            normal = line.split(' ');
            nx = parseFloat(normal[1]);
            ny = parseFloat(normal[2]);
            nz = parseFloat(normal[3]);
            vertexNormal.push([nx, ny, nz]);
        }

        //Faces
        else if(line.indexOf('f ') !== -1) {
            index = line.split(' ');

            //Vertex//Normal
            if(index[1].indexOf('//') !== -1) {
                i1 = index[1].split('//');
                i2 = index[2].split('//');
                i3 = index[3].split('//');
                faceVertex.push([
                    parseFloat(i1[0])-1,
                    parseFloat(i2[0])-1,
                    parseFloat(i3[0])-1
                ]);
                faceNormal.push([
                    parseFloat(i1[1])-1,
                    parseFloat(i2[1])-1,
                    parseFloat(i3[1])-1
                ]);

                if(index[4]) {
                    i4 = index[4].split('/');
                    faceVertex.push([
                        parseFloat(i1[0])-1,
                        parseFloat(i3[0])-1,
                        parseFloat(i4[0])-1
                    ]);
                    faceNormal.push([
                        parseFloat(i1[2])-1,
                        parseFloat(i3[2])-1,
                        parseFloat(i4[2])-1
                    ]);
                }
            }

            //Vertex/Texcoord/Normal
            else if(index[1].indexOf('/') !== -1) {
                i1 = index[1].split('/');
                i2 = index[2].split('/');
                i3 = index[3].split('/');
                faceVertex.push([
                    parseFloat(i1[0])-1,
                    parseFloat(i2[0])-1,
                    parseFloat(i3[0])-1
                ]);
                faceTextureCoord.push([
                    parseFloat(i1[1])-1,
                    parseFloat(i2[1])-1,
                    parseFloat(i3[1])-1
                ]);
                faceNormal.push([
                    parseFloat(i1[2])-1,
                    parseFloat(i2[2])-1,
                    parseFloat(i3[2])-1
                ]);

                if(index[4]) {
                    i4 = index[4].split('/');
                    faceVertex.push([
                        parseFloat(i1[0])-1,
                        parseFloat(i3[0])-1,
                        parseFloat(i4[0])-1
                    ]);
                    faceTextureCoord.push([
                        parseFloat(i1[1])-1,
                        parseFloat(i3[1])-1,
                        parseFloat(i4[1])-1
                    ]);
                    faceNormal.push([
                        parseFloat(i1[2])-1,
                        parseFloat(i3[2])-1,
                        parseFloat(i4[2])-1
                    ]);
                }
            }

            //Vertex
            else {
                faceVertex.push([
                    parseFloat(index[1])-1,
                    parseFloat(index[2])-1,
                    parseFloat(index[3])-1
                ]);
                faceTextureCoord.push([
                    parseFloat(index[1])-1,
                    parseFloat(index[2])-1,
                    parseFloat(index[3])-1
                ]);
                faceNormal.push([
                    parseFloat(index[1])-1,
                    parseFloat(index[2])-1,
                    parseFloat(index[3])-1
                ]);

                if(index[4]) {
                    faceVertex.push([
                        parseFloat(index[1])-1,
                        parseFloat(index[3])-1,
                        parseFloat(index[4])-1
                    ]);
                    faceTextureCoord.push([
                        parseFloat(index[1])-1,
                        parseFloat(index[3])-1,
                        parseFloat(index[4])-1
                    ]);
                    faceNormal.push([
                        parseFloat(index[1])-1,
                        parseFloat(index[3])-1,
                        parseFloat(index[4])-1
                    ]);
                }
            }
        }
    }

    var n = [];
    var v = [];
    var t = [];
    var f = [];
    var vertexCache = {};
    var count = 0;
    var uvCoord;
    var j;

    for (i = 0; i < faceVertex.length; i++) {
        f[i] = [];
        for (j = 0; j < faceVertex[i].length; j++) {
            uvCoord = faceTextureCoord[i][j];
            vertex  = faceVertex[i][j];
            normal  = faceNormal[i][j];

            // index = vertexCache[vertex + ',' + normal + ',' + uvCoord];
            //
            // if(index === undefined) {
                index = count++;
                v.push(vertices[vertex]);
                if(vertexNormal[normal])  n.push(vertexNormal[normal]);
                if(textureCoord[uvCoord]) t.push(textureCoord[uvCoord]);
                vertexCache[vertex + ',' + normal + ',' + uvCoord] = index;
            // }
            f[i].push(index);
        }
    }

    n = computeNormals ? GeometryHelper.computeNormals(f, v) :  n;

    return {
        vertices: flatten(v),
        normals: flatten(n),
        textureCoords: flatten(t),
        indices: flatten(f)
    };
};

function flatten(arr) {
  var i = arr.length;
  var out = [];

  while (i--) out.push.apply(out, arr[i]);

  return out;
}

module.exports = OBJLoader;
