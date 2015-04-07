'use strict';
var test = require('tape');
var Geometry = require('../src/Geometry');

var primitives = {
    Box: require('../src/primitives/Box'),
    Circle: require('../src/primitives/Circle'),
    Cylinder: require('../src/primitives/Cylinder'),
    GeodesicSphere: require('../src/primitives/GeodesicSphere'),
    Icosahedron: require('../src/primitives/Icosahedron'),
    ParametricCone: require('../src/primitives/ParametricCone'),
    Plane: require('../src/primitives/Plane'),
    Sphere: require('../src/primitives/Sphere'),
    Tetrahedron: require('../src/primitives/Tetrahedron'),
    Torus: require('../src/primitives/Torus'),
    Triangle: require('../src/primitives/Triangle'),
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