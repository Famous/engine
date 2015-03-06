'use strict';

global.document = {
    documentElement: {
        style: {

        }
    },
    createElement: function(tagName) {
        return {
            nodeName: tagName,
            style: {}
        };
    }
};

var test = require('tape');
var VirtualElement = require('../src/VirtualElement');

test('VirtualElement', function(t) {
    t.end();
});
