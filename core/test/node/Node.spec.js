'use strict';

var test = require('tape');
var Node = require('../../Node');
var Scene = require('../../Scene');
var api = require('./Node.api');

test('Node class', function (t) {
    t.test('Node constructor' , function (t) {
        t.ok(Node, 'There should be a node module');
        t.equal(Node.constructor, Function, 'Node should be a function');

        t.doesNotThrow(function () {
            return new Node();
        }, 'Node should be callable with new');

        t.doesNotThrow(function () {
            return new Node();
        }, 'Node should be callable with new and another node as an argument');

        t.equal((new Node()).constructor, Node, 'Node should be a constructor function');

        var node = new Node();

        api.forEach(function (method) {
            t.ok(
                node[method] && node[method].constructor === Function,
                'Node should have a ' + method + ' method'
            );
        });

        t.end();
    });

    t.test('getChildren method', function (t) {
        var node0 = new Node();
        var node00 = new Node();
        var node01 = new Node();
        var node02 = new Node();

        t.deepEqual(node0.getChildren(), []);

        node0.addChild(node00);
        node0.addChild(node01);
        node0.addChild(node02);
        t.equal(node0.getChildren().length, 3, 'node0 should have three children after addChild');
        t.equal(node0.getChildren()[0], node00, 'node0 should have node00 as a child');
        t.equal(node0.getChildren()[1], node01, 'node0 should have node01 as child');
        t.equal(node0.getChildren()[2], node02, 'node0 should have node02 as child');

        node0.removeChild(node01);
        t.equal(node0.getChildren().length, 2, 'node0 should have two children after removing node01');
        t.equal(node0.getChildren()[0], node00, 'node0 should have node00 as first child');
        t.equal(node0.getChildren()[1], node02, 'node0 should have node01 as second child');

        t.end();
    });

    t.test('getRawChildren method', function (t) {
        var node0 = new Node();
        var node00 = new Node();
        var node01 = new Node();
        var node02 = new Node();

        t.deepEqual(node0.getRawChildren(), []);

        node0.addChild(node00);
        node0.addChild(node01);
        node0.addChild(node02);
        t.equal(node0.getRawChildren().length, 3, 'node0 should have three raw children after addChild');
        t.equal(node0.getRawChildren()[0], node00, 'node0 should have node00 as a child');
        t.equal(node0.getRawChildren()[1], node01, 'node0 should have node01 as a child');
        t.equal(node0.getRawChildren()[2], node02, 'node0 should have node02 as a child');

        node0.removeChild(node01);
        t.equal(node0.getRawChildren().length, 3, 'node0.getRawChildren() should still have three items after removing node01');
        t.equal(node0.getRawChildren()[0], node00, 'node0 should have node00 as first child');
        t.equal(node0.getRawChildren()[1], null, 'node0 should have null as a second child');
        t.equal(node0.getRawChildren()[2], node02, 'node0 should have node02 as third child');

        var node03 = new Node();

        node0.addChild(node03);
        t.equal(node0.getRawChildren().length, 3, 'node0.getRawChildren() should still have three items after removing node01 and adding node03');
        t.equal(node0.getRawChildren()[0], node00, 'node0 should have node00 as first child');
        t.equal(node0.getRawChildren()[1], node03, 'node0 should have reused empty slot to store node03');
        t.equal(node0.getRawChildren()[2], node02, 'node0 should have node02 as third child');

        t.end();
    });

    t.test('getPositionFrom method', function(t) {
        var updater = {
            message: function() {
                return updater;
            },
            requestUpdate:function() {
            }
        };
        var scene = new Scene('body', updater);

        var node0 = scene.addChild().setPosition(3,  9,  25);
        var node1 = node0.addChild().setPosition(11, 21, 13);
        var node2 = node1.addChild().setPosition(20, 22, 30);
        var node3 = node2.addChild().setPosition(14,  5,  8);

        var node4 = (new Node())    .setPosition(13, 25, 27);
        var node5 = node4.addChild().setPosition(35, 28, 46);
        var node6 = node5.addChild().setPosition(44, 19, 23);

        var pos;

        pos = node3.getPositionFrom(node2);
        t.equal(pos[0], 14);
        t.equal(pos[1], 5);
        t.equal(pos[2], 8);

        pos = node3.getPositionFrom(node1);
        t.equal(pos[0], 34);
        t.equal(pos[1], 27);
        t.equal(pos[2], 38);

        pos = node3.getPositionFrom(node0);
        t.equal(pos[0], 45);
        t.equal(pos[1], 48);
        t.equal(pos[2], 51);

        pos = node3.getPositionFrom(scene);
        t.equal(pos[0], 48);
        t.equal(pos[1], 57);
        t.equal(pos[2], 76);

        // didn't pass a Node.
        try { pos = node3.getPositionFrom({}); }
        catch (e) {
            if (e.message.match(/not an instance/)) t.pass(e.message);
            else t.fail('Instance check failed.');
        }

        // reached the scene node and didn't find the ancestor.
        try { pos = node3.getPositionFrom((new Node()).setPosition(1,2,3)); }
        catch (e) {
            if (e.message.match(/Scene node reached/)) t.pass(e.message);
            else t.fail('Scene node check failed.');
        }

        // reached a null parent and didn't find the ancestor.
        try { pos = node6.getPositionFrom(node3); }
        catch (e) {
            if (e.message.match(/Null parent reached/)) t.pass(e.message);
            else t.fail('Null parent check failed.');
        }

        t.end();
    });
});
