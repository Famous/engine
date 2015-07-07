'use strict';

var api = require('./Dispatch.api');
var Dispatch = require('../../../core/Dispatch');
var NodeStub = require('../node/Node.stub');
var Node = require('../../../core/Node');
var test = require('tape');

test('Dispatch singleton', function (t) {

    t.test('Dispatch object', function (t) {

        t.test('Dispatch should exist as a module', function (t) {
            t.equal(typeof Dispatch, 'object', 'Dispatch should be an object');
            t.end();
        });
        
        t.test('Dispatch should conform to its public api', function (t) {

            api.forEach(function (method) {
                t.ok(Dispatch[method], 'Dispatch should have a ' +
                                        method + ' method');

                t.equal(Dispatch[method].constructor, Function, 'Dispatch.'
                                                     + method + ' should be a function');
            });

            t.end();
        });

        t.end();
    });

    t.test('._setUpdater method', function (t) {

        var testUpdater = 'a';
        
        t.doesNotThrow(
            Dispatch._setUpdater.bind(Dispatch, testUpdater),
            '._setUpdater should be callable'
        );

        var stub = new NodeStub();

        Dispatch.mount('body', stub);

        t.ok(stub._setUpdater.getCall(0).calledWith(testUpdater), 'Nodes mounted with the Dispatch ' +
                                                                  'should have their updaters set to ' +
                                                                  'the dispatch\'s updater');

        var testUpdater2 = 'b';

        Dispatch._setUpdater(testUpdater2);

        var stub2 = new NodeStub();

        Dispatch.mount('body/0', stub2);

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
        var nodes = {
            'path': new Node(),
            'path/1': new Node(),
            'path/1/2': new Node(),
            'path/1/1': new Node(),
            'path/1/2/3': new Node(),
            'path/1/2/4': new Node()
        };
    
        var received = [];
    
        function onReceive(actualEvent, actualPayload) {
            t.equal(actualEvent, expectedEvent, 'Node should receive expected event');
            t.equal(actualPayload, expectedPayload, 'Node should receive expected payload');
            
            received.push(this.__path__);
        }
        
        nodes.path.addChild(nodes['path/1']);
        nodes['path/1'].addChild(nodes['path/1/2']);
        nodes['path/1'].addChild(nodes['path/1/1']);
        nodes['path/1/2'].addChild(nodes['path/1/2/3']);
        nodes['path/1/2'].addChild(nodes['path/1/2/4']);
    
        for (var path in nodes) {
            nodes[path].__path__ = path;
            nodes[path].onReceive = onReceive;
            Dispatch.mount(path, nodes[path]);
        }
        
        var expectedEvent = 'event';
        var expectedPayload = { some: 'payload' };
    
        Dispatch.dispatch('path/1', expectedEvent, expectedPayload);

        t.equal(
            received.indexOf('path/1'), -1,
            'path/1 should not receive event dispatched via Dispatch.dispatch("path/1")'
        );
        
        t.deepEqual(
            received, ['path/1/2', 'path/1/1', 'path/1/2/3', 'path/1/2/4'],
            'Dispatch.dispatch should trigger event first on parent, then on children'
        );
    
        t.end();
    });

    t.test('.dispatchUIEvents method', function (t) {
        t.end();
    });

    t.end();
});
