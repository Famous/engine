/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var test = require('tape');
var strip = require('../strip');

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
