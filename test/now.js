'use strict';

var test = require('tape');
var now = require('../src/now');

test('now', function(t) {
    t.equal(typeof now(), 'number', 'now() should return a number');
    var originalPerformance = window.performance;
    window.performance = {
        now: function() {
            return 123;
        }
    };
    t.equal(now(), 123);
    window.performance = originalPerformance;
    t.end();
});
