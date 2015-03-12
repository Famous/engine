'use strict';

var test = require('tape');
var helpers = require('../src/helpers');

test('helpers', function(t) {
    t.test('flattenArguments method', function(t) {
        t.equal(typeof helpers.flattenArguments, 'function', 'helpers.flattenArguments should be a function');
        t.deepEqual(helpers.flattenArguments([[1, 2, 3]]), [1, 2, 3]);
        t.end();
    });

    t.test('argsToArray method', function(t) {
        t.equal(typeof helpers.argsToArray, 'function', 'helpers.argsToArray should be a function');
        (function() {
            t.deepEqual(helpers.argsToArray(arguments), [1, 2, 3, 4, 5, 6, 7]);
            t.ok(Array.isArray(helpers.argsToArray(arguments)));
        })(1, 2, 3, 4, 5, 6, 7);
        t.end();
    });
});
