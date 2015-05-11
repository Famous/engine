'use strict';

var test = require('tape');
var clone = require('../src/clone');

test('clone', function(t) {
    t.equal(typeof clone, 'function', 'clone should be a function');

    var flatObject = {a: {}, b: {}, c: {}};
    t.deepEqual(clone(flatObject), flatObject, 'clone should clone flat object');

    var nestedObject = {
        test1: {
            test1test1: {
                test1test1test1: 3
            },
            test1test2: 3
        },
        test2: {},
        test3: {}
    };
    t.deepEqual(clone(nestedObject), nestedObject, 'clone should deep clone nested object');
    t.end();
});
