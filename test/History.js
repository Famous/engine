'use strict';

var test = require('tape');
var _History = require('../src/History');

test('_History', function (t) {
    t.test('constructor', function (t) {
        t.plan(2);
        t.ok(_History() instanceof _History, 'new keyword should be optional');
        var history = _History({ hashBangUrls: true });
        t.equal(history.hashBangUrls, true);
    });

    t.test('pushState method', function (t) {
        t.plan(5);
        var history = _History();
        t.ok(history.pushState instanceof Function, 'history.pushState should be a function');
        history.pushState({}, '', '/exampler-route-1');
        t.equal(history.getState(), '/exampler-route-1');
        history.pushState({}, '', '/exampler-route-2');
        t.equal(history.getState(), '/exampler-route-2');
        history.pushState({}, '', '/exampler-route-3');
        t.equal(history.getState(), '/exampler-route-3');
        var listener = function() {
            t.equal(history.getState(), '/exampler-route-2');
            history.offStateChange(listener);
        };
        history.onStateChange(listener);
        window.history.back();
    });

    t.test('pushState method (hashBangUrls)', function (t) {
        t.plan(5);
        var history = _History({ hashBangUrls: true });
        t.ok(history.pushState instanceof Function, 'history.pushState should be a function');
        history.pushState({}, '', '/exampler-route-1');
        t.equal(history.getState(), '/exampler-route-1');
        history.pushState({}, '', '/exampler-route-2');
        t.equal(history.getState(), '/exampler-route-2');
        history.pushState({}, '', '/exampler-route-3');
        t.equal(history.getState(), '/exampler-route-3');
        var listener = function() {
            t.equal(history.getState(), '/exampler-route-2');
            history.offStateChange(listener);
        };
        history.onStateChange(listener);
        window.history.back();
    });

    t.test('replaceState method', function (t) {
        t.plan(5);
        var history = _History();
        t.ok(history.replaceState instanceof Function, 'history.replaceState should be a function');
        history.pushState({}, '', '/exampler-route-1');
        t.equal(history.getState(), '/exampler-route-1');
        history.pushState({}, '', '/exampler-route-2');
        t.equal(history.getState(), '/exampler-route-2');
        history.replaceState({}, '', '/exampler-route-3');
        t.equal(history.getState(), '/exampler-route-3');
        var listener = function() {
            t.equal(history.getState(), '/exampler-route-1');
            history.offStateChange(listener);
        };
        history.onStateChange(listener);
        window.history.back();
    });

    t.test('replaceState method (hashBangUrls)', function (t) {
        t.plan(5);
        var history = _History();
        t.ok(history.replaceState instanceof Function, 'history.replaceState should be a function');
        history.pushState({}, '', '/exampler-route-1');
        t.equal(history.getState(), '/exampler-route-1');
        history.pushState({}, '', '/exampler-route-2');
        t.equal(history.getState(), '/exampler-route-2');
        history.replaceState({}, '', '/exampler-route-3');
        t.equal(history.getState(), '/exampler-route-3');
        var listener = function() {
            t.equal(history.getState(), '/exampler-route-1');
            history.offStateChange(listener);
        };
        history.onStateChange(listener);
        window.history.back();
    });

    t.test('teardown', function(t) {
        window.history.replaceState(null, '', 'index.html');
        t.end();
    });
});
