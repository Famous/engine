'use strict';
var test = require('tape');
var Geometry = require('../src/Geometry');

test('Geometry', function(t) {
    t.test('constructor', function(t) {
        var geometry = new Geometry();

        t.ok(geometry.spec instanceof Object, 'should have a spec object');
        t.equal(geometry.spec.bufferNames.length, 0, 'should not have any vertex buffers by default');
        t.ok(geometry.spec.type === 4, 'should have correct default draw style.');

        var indexValue = [[1, 2, 3]];
        var secondGeometry = new Geometry({
        	buffers: [{ name: 'indices', data: indexValue, size: 1 }]
        });

        t.notEqual(geometry.id, secondGeometry.id, 'should have unique ID');
        t.ok(secondGeometry.spec.bufferNames.indexOf('indices') !== -1, 'should pass buffer names to geometry spec');
        t.ok(secondGeometry.spec.bufferValues.indexOf(indexValue) !== -1, 'should pass buffer values to geometry spec');

        t.end();
    });

    t.end();
});