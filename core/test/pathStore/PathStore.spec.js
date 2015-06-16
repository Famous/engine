'use strict';

var test = require('tape');
var rewire = require('rewire');
var api = require('./PathStore.api');
var PathStore = rewire('../../PathStore');
var PathUtilsStub = require('../path/Path.stub');
var helpers = require('./PathStore.helpers');

PathStore.__set__('PathUtils', PathUtilsStub);
helpers.setPathStub(PathUtilsStub);

test('PathStore class', function (t) {

    t.test('PathStore constructor', function (t) {
        t.equal(PathStore.constructor, Function, 'PathStore should be a function');

        t.doesNotThrow(function () {
            return new PathStore();
        }, 'PathStore should be able to be called with new');

        t.equal((new PathStore()).constructor, PathStore, 'PathStore should be a constructor function');

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

        t.doesNotThrow(function () {
            pathStore.insert('a', a);
        }, 'insert should be able to be called with a string and any other argument');
        
        t.equal(
            pathStore.get('a'), a,
            'insert should insert the given item at the given path' + 
            ' such that the path can be used to look it up with the get method'
        );

        t.ok(
            pathStore.getItems().indexOf(a) > -1,
            'insert should insert the given item into the store such' +
            ' that it can be found in the array returned by the getItems method'
        );

        [
            [2, 0, 'b'],
            [2, 1, 'c'],
            [2, 2, 'd'],
            [3, 6, 'e'],
            [1, 4, 'f'],
            [2, 4, 'g'],
            [6, 0, 'h']
        ].forEach(function (triple) {
            pathStore.insert(triple[2], new helpers.InsertTester(triple[0], triple[1], triple[2]));
        });

        pathStore.getItems().forEach(function (item, i, items) {
            t.equal(
                pathStore.get(item.path), item,
                'insert should insert the given item at the given path' +
                ' such that the path can be used to look it up with the get method'
            );

            t.ok(
                pathStore.getItems().indexOf(item) > -1,
                'insert should insert the given item into the store' +
                ' such that it can be found in the array returned by the getItems method'
            );

            if (items[i + 1]) {
                t.ok(
                    items[i + 1].isAfter(items[i]),
                    'insert should order items such that they are sorted by depth and ties are broken by index'
                );
            }
        });
        
        t.end();
    });

    t.test('.remove method', function (t) {
        var pathStore = new PathStore();
        var index;

        Array.apply(null, Array(10)).map(function (_, i) {
            return new helpers.InsertTester(i, 0, String.fromCharCode(97 + i));
        }).forEach(function (it) {
            pathStore.insert(it.path, it);
        });

        // sanity check
        if (pathStore.getItems().length !== 10) throw new Error('PathStore.insert is broken');


        function removeItem (i) {
            var ch = String.fromCharCode(i + 97);
            var b = pathStore.get(ch);

            if (b) {
                t.doesNotThrow(function () {
                    pathStore.remove(ch);
                }, 'remove should be able to be called and remove an item by key');

                t.equal(pathStore.get(ch), undefined, '.remove should remove the item at the path');

                t.equal(
                    pathStore.getItems().indexOf(b), -1,
                    'removed items should not be available in the array returned by getItems'
                );
                return true;
            }
            return false;
        }

        function checkOrder () {
            pathStore.getItems().forEach(function (item, i, items) {
                if (items[i + 1]) {
                    t.ok(
                        items[i + 1].isAfter(items[i]),
                        'remove should preserve the sort of the items in PathStore'
                    );
                }
            });
        }

        while (pathStore.getItems().length) {
            index = (Math.random() * 11)|0;
            if (removeItem(index)) checkOrder();
        }

        t.end();
    });

    t.end();
});

