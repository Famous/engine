'use strict';
var test = require('tape');
var sort = require('../src/Geometry');

test('radixSort', function(t) {
    var source = [];
    while (source.length < 1e3) source.push((.5 - Math.random()) * 100)
    var test = sort(source.slice());
    var reference = source.slice().sort(function (a, b) { return a - b });

    assert(checkSorted(test));;
    assert(reference.join('') === reference.join(''));

    function checkSorted (test){
        for (var i= 0; i < test.length - 1; i++) {
            if (test[i].x > test[i+1].x)  return false;
        }
        return true;
    }

});


