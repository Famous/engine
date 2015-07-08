'use strict';

var rewire = require('rewire');
var api = require('./Dispatch.api');
var Dispatch = rewire('../../../core/Dispatch');
var PathUtilsStub = require('../path/Path.stub');
var NodeStub = require('../node/Node.stub');
var test = require('tape');

Dispatch.__set__('PathUtils', PathUtilsStub);

test('Dispatch singleton', function (t) {
    
    t.test('Dispatch should conform to its public api', function (t) {
        
        var dispatch = new Dispatch();

        api.forEach(function (method) {
            
            t.ok(dispatch[method], 'dispatch should have a ' +
                                    method + ' method');

            t.equal(dispatch[method].constructor, Function, 'dispatch.'
                                                 + method + ' should be a function');
        });

        t.end();
    });

    t.test('._setUpdater method', function (t) {
        var dispatch = new Dispatch();

        var testUpdater = 'a';
        
        t.doesNotThrow(
            dispatch._setUpdater.bind(dispatch, testUpdater),
            '._setUpdater should be callable'
        );

        var stub = new NodeStub();

        dispatch.mount('body', stub);

        t.ok(stub._setUpdater.getCall(0).calledWith(testUpdater), 'Nodes mounted with the dispatch ' +
                                                                  'should have their updaters set to ' +
                                                                  'the dispatch\'s updater');

        var testUpdater2 = 'b';

        dispatch._setUpdater(testUpdater2);

        var stub2 = new NodeStub();

        dispatch.mount('body/0', stub2);

        t.notOk(stub2._setUpdater.getCall(0).calledWith(testUpdater), 'Nodes mounted with the Dispatch ' +
                                                                      'should have their updaters set to ' +
                                                                      'the dispatch\'s current updater and not a previous one');

        t.ok(stub2._setUpdater.getCall(0).calledWith(testUpdater2), 'Nodes mounted with the Dispatch ' +
                                                                    'should have their updaters set to ' +
                                                                    'the dispatch\'s current updater');

        t.ok(stub._setUpdater.getCall(1).calledWith(testUpdater2), 'Nodes mounted with the Dispatch ' +
                                                                   'should have their updaters set to the new ' +
                                                                   'updater when the dispatch has its updater changed');

        t.end();
    });

    t.test('.addChildrenToQueue method', function (t) {
        t.end();
    });

    t.test('.next method', function (t) {
        t.end();
    });

    t.test('.breadthFirstNext method', function (t) {
        t.end();
    });

    t.test('.mount method', function (t) {
        t.end();
    });

    t.test('.dismount method', function (t) {
        t.end();
    });

    t.test('.getNode method', function (t) {
        t.end();
    });

    t.test('.show method', function (t) {
        t.end();
    });

    t.test('.hide method', function (t) {
        t.end();
    });

    t.test('.lookupNode method', function (t) {
        t.end();
    });

    t.test('.dispatch method', function (t) {
        t.end();
    });

    t.test('.dispatchUIEvents method', function (t) {
        t.end();
    });

    t.end();
});
