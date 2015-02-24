'use strict';

var test = require('tape');
var clone = require('../src/clone');

test('clone', function(t) {
    t.equal(typeof clone, 'function', 'Utility.clone should be a function');

    var flatObject = {a: {}, b: {}, c: {}};
    t.deepEqual(clone(flatObject), flatObject, 'Utility.clone should clone flat object');

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
    t.deepEqual(clone(nestedObject), nestedObject, 'Utility.clone should deep clone nested object');
    t.end();
});
