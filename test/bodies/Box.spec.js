'use strict';

var Particle = require('../../src/bodies/Particle');
var Box = require('../../src/bodies/Box');
var test = require('tape');

test('Box', function(t) {
    var b = new Box({size:[10,10,10]});

    t.test('should extend Particle', function(t) {
        t.assert(Box instanceof Function, 'Box should be a constructor');

        t.assert(b instanceof Box && b instanceof Particle, 'new boxes should be instances of Particle');

        t.end();
    });

    t.end();
});