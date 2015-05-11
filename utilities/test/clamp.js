'use strict';

var test = require('tape');
var clamp = require('../clamp');

test('clamp', function(t) {
    t.equal(typeof clamp, 'function', 'clamp should be a function');

    t.equal(clamp(0, 1, 4), 1);
    t.equal(clamp(5, 1, 4), 4);
    t.equal(clamp(3, 1, 4), 3);

    t.end();
});
