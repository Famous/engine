'use strict';

var test = require('tape');
var KeyCodes = require('../src/KeyCodes');

test('KeyCodes', function(t) {
    t.equal(typeof KeyCodes, 'object', 'KeyCodes should export an object');
    for (var key in KeyCodes) {
        t.equal(typeof KeyCodes[key], 'number', 'KeyCodes should be a flat object with number codes as values');
    }
    t.end();
});



