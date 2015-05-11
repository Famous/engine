var rAF = require('../src/requestAnimationFrame');
var test = require('tape');

test('requestAnimationFrame', function(t) {
    t.plan(1);
    var t1 = Date.now();
    rAF(function(t2) {
        t.equal(t1, t2);
    });
});
