'use strict';

var test = require('tape');
var Router = require('../src/Router');

test('Router', function (t) {
    t.test('constructor', function (t) {
        t.plan(1);
        t.ok(Router() instanceof Router, 'new keyword should be optional');
    });

    t.test('validate option', function (t) {
        t.plan(3);
        var router = Router({
            '/works': function() {
                t.pass();
            }
        }, {
            silent: true,
            validate: true
        });

        t.doesNotThrow(function() {
            router.navigate('/works', { invoke: true });
        });
    
        t.throws(function() {
            router.navigate('/no', { invoke: true });
        }, /Unknown route/);
    });

    t.test('proxy option', function (t) {
        t.plan(1);
        var router = Router({
            '/works': 'works'
        }, {
            silent: true,
            proxy: {
                'works': function() {
                    t.pass();
                }
            }
        });

        router.navigate('/works', { invoke: true });
    });

    t.test('pushState routing', function (t) {
        t.plan(2);
        var count = 0;
        var router = new Router({
            '/two': function () {
                t.equal(count++, 0);
            },
            '/three': function () {
                t.equal(count++, 1);
            }
        }, { silent: true });

        router.navigate('/two', { invoke: true });
        router.navigate('/three', { invoke: true });
    });

    t.test('hash routing', function (t) {
        t.plan(2);
        var count = 0;
        var router = new Router({
            '/two': function () {
                t.equal(count++, 0);
            },
            '/three': function () {
                t.equal(count++, 1);
            }
        }, {
            silent: true,
            hashBangUrls: true
        });

        router.navigate('/two', { invoke: true });
        router.navigate('/three', { invoke: true });
    });

    t.test('regular expressions', function (t) {
        t.plan(6);
        var router = new Router({ silent: true });

        router.addRoute(/\/\d(\d)(\d)(\d)(.*)/, function(one, three, four, test) {
            t.pass();
            t.equal(one, '1');
            t.equal(three, '3');
            t.equal(four, '4');
            t.equal(test, 'test');
            t.equal(router._history.getState(), '/2134test');
        });

        router.navigate('/three', { invoke: true });
        router.navigate('/2134test', { invoke: true });
    });

    t.test('optional params', function (t) {
        t.plan(2);
        var router = Router({
            '/t:est?': function (est) {
                t.pass();
                t.equal(est, 'est');
            },
            '/no': function () {
                t.fail();
            }
        }, { silent: true });

        router.navigate('/test', { invoke: true });
    });

    t.test('nested routing', function (t) {
        t.plan(4);
        var i = 0;
        var nestedRouter = Router({
            '/a': {
                '/0': function() {
                    t.equal(i++, 0);
                },
                '/1': function() {
                    t.equal(i++, 1);
                }
            },
            '/2': function() {
                t.equal(i++, 2);
            },
            '/3': function() {
                t.equal(i++, 3);
            }
        }, {
            silent: true
        });

        nestedRouter.navigate('/a/0', { invoke: true });
        nestedRouter.navigate('/a/1', { invoke: true });
        nestedRouter.navigate('/2', { invoke: true });
        nestedRouter.navigate('/3', { invoke: true });
        nestedRouter.navigate('/noop', { invoke: true });
    });

    t.test('UTF8 characters', function (t) {
        t.plan(2);
        var i = 0;
        var router = Router({
            '/Füße': function() {
                t.equal(i++, 0);
            },
            '/foot': function() {
                t.equal(i++, 1);
            }
        }, { silent: true });

        router.navigate('/Füße', { invoke: true });
        router.navigate('/foot', { invoke: true });
    });

    t.test('root option', function (t) {
        window.history.replaceState(null, '', '/root')
        t.plan(3);
        var i = 0;
        var router = Router({
            '/test1': function() {
                t.equal(i++, 0);
            },
            '/test2': function() {
                t.equal(i++, 1);
            }
        }, {
            silent: true,
            root: '/root'
        });

        router.navigate('/test1', { invoke: true });
        t.equal(i, 0);
        // debugger;
        router.navigate('/root/test1', { invoke: true });
        router.navigate('/test2', { invoke: true });
        router.navigate('/root/test2', { invoke: true });
    });

    t.test('teardown', function(t) {
        window.history.replaceState(null, '', '/index.html');
        t.end();
    });
});