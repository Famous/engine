'use strict';

var test = require('tape');
var api = require('./Path.api');
var PathUtils = require('../../Path');
var helpers = require('./Path.helpers');

test('PathUtils', function (t) {

    t.test('singleton', function (t) {
        t.ok(typeof PathUtils === 'object', 'PathUtils should be a function');
        api.forEach(function (method) {
            t.ok(PathUtils[method] && PathUtils[method].constructor === Function, 'PathUtils should have a ' + method + ' method.');
        });
        t.end();
    });

    t.test('.hasTrailingSlash method', function (t) {
        helpers.generateTestCases().forEach(function (path) {

            t.ok(
                !PathUtils.hasTrailingSlash(path),
                'Path should accurately report that ' + path + ' does not have a trailing slash'
            );

            var withSlash = helpers.addTrailingSlash(path);

            t.ok(
                PathUtils.hasTrailingSlash(withSlash),
                'Path should accurately report that ' + withSlash + ' does have a trailing slash'
            );

        });

        t.end();
    });

    t.test('.depth method', function (t) {
        var cases = Array.apply(null, Array(10)).map(function (_, i) {
            return i;
        });

        var testPaths = cases.map(helpers.generatePathOfDepth.bind(helpers));

        testPaths.forEach(function (path, i) {
            var depth = PathUtils.depth(path);
            var target = cases[i];

            t.equal(depth, target, '.depth should accurately report that path ' + path + ' has a depth of ' + target);

            var withTrailingSlash = helpers.addTrailingSlash(path);
            depth = PathUtils.depth(withTrailingSlash);

            t.equal(depth, target, '.depth should not care about trailing slashes');

            var withId = helpers.makeID(path);
            withTrailingSlash = helpers.addTrailingSlash(withId);
            depth = PathUtils.depth(withId);

            t.equal(depth, target, '.depth should not discriminate if the path selector is an id');
            
            depth = PathUtils.depth(withTrailingSlash);

            t.equal(depth, target, '.depth should not care about trailing slashes or an id selector');

            var withClass = helpers.makeClass(path);
            depth = PathUtils.depth(withClass);

            t.equal(depth, target, '.depth should not discriminate if the path selector is a class');

            withTrailingSlash = helpers.addTrailingSlash(withClass);
            depth = PathUtils.depth(withTrailingSlash);

            t.equal(
                    depth, target, 
                    '.depth should give the same depth if the path has a class selector and a trailing slash'
            );
        });
        
        t.end();
    });

    t.test('.index method', function (t) {
        var range = Array.apply(null, Array(10)).map(function (_, i) {
            return i * 10 + (Math.random() * (i * 10))|0;
        });

        var cases = [];
        var is = [];

        helpers.generateTestCases().forEach(function (path) {
            range.forEach(function (i) {
                cases.push(path + '/' + i);
                cases.push(path + '/' + i + '/');
                is.push(i, i);
            });
        });

        cases.forEach(function (path, i) {
            var index = PathUtils.index(path);
            t.equal(index, is[i], 'path ' + path + ' should have an index of ' + is[i]);
        });

        t.end();
    });
    
    t.test('.indexAtDepth method', function (t) {
        Array.apply(null, Array(10)).map(function () {
            return Array.apply(null, Array(10)).map(function () {
                return (Math.random() * 1000)|0;
            });
        }).forEach(function (listOfIndecies) {
            var path = helpers.generateSelector() + '/' + listOfIndecies.join('/');
            path.split('/').forEach(function (index, i) {
                var result = PathUtils.indexAtDepth(path, i);
                t.equal(
                    result, result.constructor === String ? index : parseInt(index), 
                    'the index of ' + path + ' at depth ' + i + ' should be ' + index
                );
            });
        });
        t.end();
    });

    t.test('.parent method', function (t) {

        helpers.generateTestCases().forEach(function (path) {

            var child = helpers.addDepth(path);
            t.equal(PathUtils.parent(child), path, 'the parent of ' + child + ' should be ' + path);

        });

        t.equal(
            PathUtils.parent(helpers.generateSelector()), '',
            'paths with no depth should have a parent path of empty string'
        );

        t.end();
    });

    t.test('.isChildOf method', function (t) {
        helpers.generateTestCases().forEach(function (path) {

            var child = helpers.addDepth(path);
            var grandChild = helpers.addDepth(child);

            for (var i = 0 ; i < 2 ; i++) {
                t.ok(PathUtils.isChildOf(child, path), child + ' should be a child of ' + path);
        
                t.notOk(PathUtils.isChildOf(grandChild, path), grandChild + ' should not be a child of ' + path);

                t.notOk(PathUtils.isChildOf(path, child), path + ' should not be a child of ' + child);
        
                t.notOk(PathUtils.isChildOf(path, grandChild), path + ' should not be a child of ' + grandChild);

                t.notOk(PathUtils.isChildOf(path, path), path + ' should not be a child of itself');

                child = helpers.addTrailingSlash(child);
                grandChild = helpers.addTrailingSlash(grandChild);
            }

        });

        t.end();
    });

    t.test('.isDescendentOf method', function (t) {

        helpers.generateTestCases().forEach(function (path) {

            var child = helpers.addDepth(path);
            var grandChild = helpers.addDepth(child);
            var greatGrandChild = helpers.addDepth(grandChild);

            for (var i = 0 ; i < 2 ; i++) {

                t.ok(PathUtils.isDescendentOf(child, path), child + ' should be a descendent of ' + path);

                t.ok(PathUtils.isDescendentOf(grandChild, path), grandChild + ' should be a descendent of ' + path);

                t.ok(
                    PathUtils.isDescendentOf(greatGrandChild, path),
                    greatGrandChild + ' should be a descendent of ' + path
                );

                t.notOk(
                    PathUtils.isDescendentOf(path, child),
                    path + ' should not be a descendent of ' + child
                );

                t.notOk(
                    PathUtils.isDescendentOf(path, grandChild),
                    path + ' should not be a descendent of ' + grandChild
                );

                t.notOk(
                    PathUtils.isDescendentOf(path, greatGrandChild),
                    path + ' should not be a descendent of ' + greatGrandChild
                );

                t.notOk(
                    PathUtils.isDescendentOf(path, path),
                    path + ' should not be a descendent of itself'
                );

                child = helpers.addTrailingSlash(child);
                grandChild = helpers.addTrailingSlash(grandChild);
                greatGrandChild = helpers.addTrailingSlash(greatGrandChild);
            }
        });

        t.end();

    });

    t.test('.getSelector method', function (t) {

        var selector = helpers.generateSelector();
        var path = selector;

        for (var i = 0 ; i < 10 ; i++) {
            t.equal(selector, PathUtils.getSelector(path), 'the selector of path ' + path + ' should be ' + selector);
            path = helpers.addDepth(path);
        }

        t.end();
    });

    t.end();
});


