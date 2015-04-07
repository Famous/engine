'use strict';
var test = require('tape');
var GeometryHelper = require('../src/GeometryHelper');
var Vec3 = require('famous-math').Vec3;

test('GeometryHelper', function(t) {
    t.test('generateParametric', function(t) {

    	t.ok(
    		GeometryHelper.generateParametric instanceof Function, 
    		'Should have generateParametric function'
    	);

    	var generator = function generator(u, v, pos) {
    		generator.callCount++;

		    var x = Math.sin(u) * Math.cos(v);
		    var y = Math.cos(u);
		    var z = -Math.sin(u) * Math.sin(v);

		    pos[0] = x;
		    pos[1] = y;
		    pos[2] = z;
		}
        generator.callCount = 0;

    	var detailX = 10;
    	var detailY = 10;

    	var buffers = GeometryHelper.generateParametric(detailX, detailY, generator);

    	t.equals(
    		generator.callCount,
    		(detailX + 1) * detailY,
    		'Should call generator exactly (detailX + 1) * detailY times!'
    	);

        t.end();
    });

    t.end();
});