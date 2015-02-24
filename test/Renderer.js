'use strict';

var test = require('tape');
var Renderer = require('../src/Renderer');

test('Renderer', function(t) {
    t.test('constructor', function(t) {
        t.plan(1);
        t.doesNotThrow(function() {
            new Renderer();
        });
    });

    t.test('step method', function(t) {
        t.plan(1);
        var renderer = new Renderer();
        t.equal(typeof renderer.step, 'function', 'renderer.step should be a function');
    });

    t.test('loop method', function(t) {
        t.plan(1);
        var renderer = new Renderer();
        t.equal(typeof renderer.loop, 'function', 'renderer.loop should be a function');
    });

    t.test('sendEvent method', function(t) {
        t.plan(1);
        var renderer = new Renderer();
        t.equal(typeof renderer.sendEvent, 'function', 'renderer.sendEvent should be a function');
    });

    t.test('handleWith method', function(t) {
        t.plan(1);
        var renderer = new Renderer();
        t.equal(typeof renderer.handleWith, 'function', 'renderer.handleWith should be a function');
    });

    t.test('getOrSetContext method', function(t) {
        t.plan(1);
        var renderer = new Renderer();
        t.equal(typeof renderer.getOrSetContext, 'function', 'renderer.getOrSetContext should be a function');
    });

    t.test('giveSizeFor method', function(t) {
        t.plan(1);
        var renderer = new Renderer();
        t.equal(typeof renderer.giveSizeFor, 'function', 'renderer.giveSizeFor should be a function');
    });

    t.test('handleCommands method', function(t) {
        t.plan(1);
        var renderer = new Renderer();
        t.equal(typeof renderer.handleCommands, 'function', 'renderer.handleCommands should be a function');
    });

    t.test('receiveCommands method', function(t) {
        t.plan(1);
        var renderer = new Renderer();
        t.equal(typeof renderer.receiveCommands, 'function', 'renderer.receiveCommands should be a function');
    });

    t.test('sendResults method', function(t) {
        t.plan(1);
        var renderer = new Renderer();
        t.equal(typeof renderer.sendResults, 'function', 'renderer.sendResults should be a function');
    });

    t.test('receiveWorker method', function(t) {
        t.plan(1);
        var renderer = new Renderer();
        t.equal(typeof renderer.receiveWorker, 'function', 'renderer.receiveWorker should be a function');
    });
});
