'use strict';

var test = require('tape');
var ConvexBodyFactory = require('../../src/bodies/ConvexBodyFactory');
var Vec3 = require('famous-math').Vec3;

function arraysAreApproximatelyEqual(a, b, tolerance) {
    for (var i = 0, len = a.length; i < len; i++) {
        if (Math.abs(a[i] - b[i]) > tolerance) return false;
    }
    return true;
}

function vec3sAreEqual(a,b) {
    return Math.abs(a.x - b.x) < 0.001 && Math.abs(a.y - b.y) < 0.001 && Math.abs(a.z - b.z) < 0.001;
}

test('ConvexBodyFactory', function(t) {
    t.assert(ConvexBodyFactory instanceof Function, 'ConvexBodyFactory should be a function');

    var pyramidVertices = [
        new Vec3(50,0,50),
        new Vec3(-50,0,50),
        new Vec3(0,0,-50),
        new Vec3(0,-100,0),

        new Vec3(0,-25,0) // ConvexHullshould disregard this Vec3
    ];

    var sphereVertices = [];
    var tracer = new Vec3(0,50,0);
    sphereVertices.push(Vec3.clone(tracer));
    var detail = 15;
    for (var i = 0; i < detail-1; i++) {
        tracer.rotateZ(Math.PI/detail);
        sphereVertices.push(Vec3.clone(tracer));
        for (var j = 0; j < 2*detail-1; j++) {
            tracer.rotateY(Math.PI/detail);
            sphereVertices.push(Vec3.clone(tracer));
        }
        tracer.rotateY(Math.PI/detail);
    }
    tracer.rotateZ(Math.PI/detail);
    sphereVertices.push(Vec3.clone(tracer));

    var boxVertices = [
        new Vec3(50,50,50),
        new Vec3(50,50,-50),
        new Vec3(50,-50,-50),
        new Vec3(-50,-50,-50),
        new Vec3(-50,-50,50),
        new Vec3(-50,50,50),
        new Vec3(50,-50,50),
        new Vec3(-50,50,-50)
    ];

    var CustomPyramid = ConvexBodyFactory(pyramidVertices);
    var CustomSphere = ConvexBodyFactory(sphereVertices);
    var CustomBox = ConvexBodyFactory(boxVertices);

    t.test('custom body shape', function(t) {
        t.assert(CustomPyramid instanceof Function, ' ConvexBodyFactory should return a constructor');

        var pyramid = new CustomPyramid({mass: 10, size: [60,75,60]});

        t.assert(pyramid.constructor.name === 'ConvexBody', 'bodies should be instances of ConvexBody');

        t.assert(pyramid.vertices.length === 4, 'the custom shape should have disregarded vertices not on the convex hull');

        var minX = Infinity, maxX = -Infinity;
        var minY = Infinity, maxY = -Infinity;
        var minZ = Infinity, maxZ = -Infinity;

        for (var i = 0, len = pyramid.vertices.length; i < len; i++) {
            var vertex = pyramid.vertices[i];
            if (vertex.x < minX) minX = vertex.x;
            if (vertex.x > maxX) maxX = vertex.x;
            if (vertex.y < minY) minY = vertex.y;
            if (vertex.y > maxY) maxY = vertex.y;
            if (vertex.z < minZ) minZ = vertex.z;
            if (vertex.z > maxZ) maxZ = vertex.z;
        }

        t.assert((maxX - minX) === 60 && (maxY - minY) === 75 && (maxZ - minZ) === 60, 'bodies should have vertices that reflect user supplied size');

        t.end();
    });

    t.test('inertia properties should respond to mass and size', function(t) {
        var sphere = new CustomSphere({mass: 10, size: [40,40,40]});
        var ellipsoid = new CustomSphere({mass: 10, size: [40,80,50]});
        var box = new CustomBox({mass: 10, size: [50,75,30]});

        var sphereInertia = sphere.localInertia.get();
        var ellipsoidInertia = ellipsoid.localInertia.get();
        var boxInertia = box.localInertia.get();

        var exactSphereInertia = [10*20*20*2/5,0,0,0,10*20*20*2/5,0,0,0,10*20*20*2/5];
        var exactEllipsoidInertia = [10*(40*40+25*25)/5,0,0,0,10*(20*20+25*25)/5,0,0,0,10*(20*20+40*40)/5];
        var exactBoxInertia = [10*(75*75+30*30)/12,0,0,0,10*(50*50+30*30)/12,0,0,0,10*(50*50+75*75)/12];

        t.assert(arraysAreApproximatelyEqual(sphereInertia, exactSphereInertia, 10), 'should be able to approximate a sphere\'s inertia tensor');
        t.assert(arraysAreApproximatelyEqual(ellipsoidInertia, exactEllipsoidInertia, 30), 'should be able to stretch the sphere to approximate an ellipsoid\'s inertia tensor');
        t.assert(arraysAreApproximatelyEqual(boxInertia, exactBoxInertia, 1), 'should be able to approximate a box\'s inertia tensor');

        t.end();
    });

    t.test('support prototypal method', function(t) {
        var box = new CustomBox({mass: 10, size: [50,75,30]});
        t.assert(box.support instanceof Function, '.support should be a function');
        var d = new Vec3(1,0.1,0);

        t.assert(vec3sAreEqual(box.support(new Vec3(1,1,1)), new Vec3(25,37.5,15)) &&
                 vec3sAreEqual(box.support(new Vec3(-1,1,1)), new Vec3(-25, 37.5, 15)) &&
                 vec3sAreEqual(box.support(new Vec3(-1,-1,-1)), new Vec3(-25, -37.5, -15)), 'should provide an accurate .support method');

        t.end()
    });

    t.test('updateShape prototypal method', function(t) {
        var box = new CustomBox({mass: 10, size: [50,75,30]});
        box.setOrientation(1,2,3,4);
        box.updateShape();
        var q = box.orientation;
        var verticesAreCorrect = true;
        var s = box._scale;
        for (var i = 0; i < 8; i++) {
            var temp = Vec3.clone(box.hull.vertices[i]);
            temp.x *= s[0];
            temp.y *= s[1];
            temp.z *= s[2];
            if (!vec3sAreEqual(box.vertices[i], q.rotateVector(temp, new Vec3()))) {
                verticesAreCorrect = false;
                break;
            }
        }
        t.assert(verticesAreCorrect, 'should rotate vertices correctly');

        t.end();
    });

    t.end();
});