'use strict';
var test = require('tape');
var Geometry = require('../Geometry');

var primitives = {
    Box: require('../primitives/Box'),
    Circle: require('../primitives/Circle'),
    Cylinder: require('../primitives/Cylinder'),
    GeodesicSphere: require('../primitives/GeodesicSphere'),
    Icosahedron: require('../primitives/Icosahedron'),
    ParametricCone: require('../primitives/ParametricCone'),
    Plane: require('../primitives/Plane'),
    Sphere: require('../primitives/Sphere'),
    Tetrahedron: require('../primitives/Tetrahedron'),
    Torus: require('../primitives/Torus'),
    Triangle: require('../primitives/Triangle'),
}

test('Primitives', function(t) {

    for (var name in primitives) {
        var primitive = new primitives[name]();

        t.ok(primitive instanceof Geometry, 'should be an instance of a static geometry');

        t.notEquals(primitive.spec.bufferNames.indexOf('texCoord'), -1, 'should contain a texCoord buffer');
        t.notEquals(primitive.spec.bufferNames.indexOf('normals'), -1, 'should contain a normal buffer');
        t.notEquals(primitive.spec.bufferNames.indexOf('pos'), -1, 'should contain a pos buffer');

        if (name !== 'Circle') {
            t.notEquals(primitive.spec.bufferNames.indexOf('indices'), -1, 'should contain an index buffer');
        }
   }

    t.end();
});