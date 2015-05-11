'use strict'

var test = require('tape');
var strip = require('../src/strip');

test('strip', function(t) {
    t.equal(typeof strip, 'function', 'strip should be a function');

    t.deepEqual(strip({}), {});

    t.deepEqual(null, null);
    t.deepEqual(123, 123);
    t.deepEqual(strip(function() {}), null);

    t.deepEqual(strip({
        aFunction: function() {}
    }), {
        aFunction: null
    });
    
    t.deepEqual(
        strip(
            { nested: { aFunction: function() {} } }
        ),
        { nested: { aFunction: null } }
    );
    
    t.deepEqual(
        strip({
            nested: { aFunction: function() {} },
            nested2: { aFunction: function() {}, bFunction: null }
        }),
        {
            nested: { aFunction: null },
            nested2: { aFunction: null, bFunction: null }
        }
    );
    
    t.deepEqual(
        strip({
            nested: { aFunction: function() {}, c: 'string' },
            nested2: { aFunction: function() {}, bFunction: null }
        }),
        {
            nested: { aFunction: null, c: 'string' },
            nested2: { aFunction: null, bFunction: null }
        }
    );
    
    t.deepEqual(
        strip({
            nested: { aFunction: function() {}, c: 'string', d: {} },
            nested2: { aFunction: function() {}, bFunction: null }
        }),
        {
            nested: { aFunction: null, c: 'string', d: {} },
            nested2: { aFunction: null, bFunction: null }
        }
    );

    function MyClass() {}


    t.deepEqual(
        strip({
            nested: { aFunction: function() {}, c: 'string', d: new MyClass() },
            nested2: { aFunction: function() {}, bFunction: null }
        }),
        {
            nested: { aFunction: null, c: 'string', d: null },
            nested2: { aFunction: null, bFunction: null }
        }
    );

    t.end();
});
