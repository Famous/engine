var test = require('tape');
var rewire = require('rewire');
var api = require('./PathStore.api');
var PathStore = rewire('../../PathStore');
var PathUtilsStub = require('../path/Path.stub');
var helpers = require('./PathStore.helpers');

PathStore.__set__('PathUtils', PathUtilsStub);

test('PathStore class', function (t) {

    t.test('PathStore constructor', function (t) {
        t.ok(PathStore.constructor === Function, 'PathStore should be a function');

        t.doesNotThrow(function () {
            return new PathStore();
        }, 'PathStore should be able to be called with new');

        t.ok((new PathStore()).constructor === PathStore, 'PathStore should be a constructor function');

        var pathStore = new PathStore();

        api.forEach(function (method) {
            t.ok(
                pathStore[method] && pathStore[method].constructor === Function,
                'PathStore should have a ' + method + ' method'
            );
        });

        t.end();
    });
    
    t.test('.insert method', function (t) {
        var pathStore = new PathStore();

        var a = new helpers.InsertTester(1, 0, 'a');

        // a should be before b which should be before c
        
        a.insertInto(pathStore, PathUtilsStub);
        
        t.equal(
            pathStore.get('a'), a,
            'insert should insert the given item at the given path such that the path can be used to look it up with the get method'
        );

        t.ok(
            pathStore.getItems().indexOf(a) > -1,
            'insert should insert the given item into the store such that it can be found in the array returned by the getItems method'
        );

        new helpers.InsertTester(2, 0, 'b').insertInto(pathStore, PathUtilsStub);
        new helpers.InsertTester(2, 1, 'c').insertInto(pathStore, PathUtilsStub);
        new helpers.InsertTester(2, 2, 'd').insertInto(pathStore, PathUtilsStub);
        new helpers.InsertTester(3, 6, 'e').insertInto(pathStore, PathUtilsStub);
        new helpers.InsertTester(1, 4, 'f').insertInto(pathStore, PathUtilsStub);
        new helpers.InsertTester(2, 4, 'g').insertInto(pathStore, PathUtilsStub);
        new helpers.InsertTester(6, 0, 'h').insertInto(pathStore, PathUtilsStub);

        var res = pathStore.getItems().forEach(function (item, i, items) {
            if (items[i + 1]) {
                t.ok(
                    items[i + 1].isAfter(items[i]),
                    'insert should order items such that they are sorted by depth and ties are broken by index'
                );
            }
        });
        
        t.end();
    });

    t.end();
});

