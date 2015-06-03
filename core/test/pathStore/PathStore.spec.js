var test = require('tape');
var rewire = require('rewire');
var PathStore = rewire('../../PathStore');
var api = require('./PathStore.api');

test('PathStore class', function (t) {

    t.test('PathStore constructor', function (t) {
        t.ok(PathStore.constructor === Function, 'PathStore should be a function');

        t.doesNotThrow(function () {
            return new PathStore();
        }, 'PathStore should be able to be called with new');

        t.ok((new PathStore).constructor === PathStore, 'PathStore should be a constructor function');

        var pathStore = new PathStore();

        api.forEach(function (method) {
            t.ok(pathStore[method] && pathStore[method].constructor === Function, 'PathStore should have a ' + method + ' method');
        });

        t.end();
    });
    
    t.test('.insert method', function (t) {
        var pathStore = new PathStore();

        t.end();
    });

    t.end();
});

