/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/*jshint -W079 */

'use strict';

var test = require('tape');
var Node = require('../Node');
var Size = require('../Size');
var Scene = require('../Scene');
var DefaultNodeSpec = require('./expected/DefaultNodeSpec');

var IDENT = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
];

function createMockNode() {
    return {
        sentDrawCommands: [],
        sendDrawCommand: function(command) {},
        shown: true,
        isShown: function() {
            return this.shown;
        },
        addComponent: function() {},
        location: 'body/0',
        getLocation: function() {
            return this.location;
        },
        transform: IDENT,
        getTransform: function() {
            return this.transform;
        },
        requestUpdate: function() {},
        size: [0, 0, 0],
        getSize: function() {
            return this.size;
        },
        sizeMode: [0, 0, 0],
        getSizeMode: function() {
            return this.sizeMode;
        },
        uiEvents: [],
        getUIEvents: function() {
            return this.uiEvents;
        },
        opacity: 1,
        getOpacity: function() {
            return this.opacity;
        },
        updater: {
            requestUpdate: function() {}
        },
        getUpdater: function() {
            return this.updater;
        }
    };
}

test('Node', function(t) {
    t.test('constructor', function(t) {
        t.equal(typeof Node, 'function', 'Node should be a constructor function');
        new Node();
        t.end();
    });

    t.test('enum', function(t) {
        t.equal(Node.RELATIVE_SIZE, Size.RELATIVE, 'Node.RELATIVE should be equivalent to Size.RELATIVE');
        t.equal(Node.ABSOLUTE_SIZE, Size.ABSOLUTE, 'Node.ABSOLUTE should be equivalent to Size.ABSOLUTE');
        t.equal(Node.RENDER_SIZE, Size.RENDER, 'Node.RENDER should be equivalent to Size.RENDER');
        t.equal(Node.DEFAULT_SIZE, Size.DEFAULT, 'Node.DEFAULT should be equivalent to Size.DEFAULT');
        t.end();
    });

    t.test('Spec constructor', function(t) {
        t.equal(typeof Node.Spec, 'function', 'Node.Spec should be a constructor function');
        t.deepEqual(new Node.Spec(), DefaultNodeSpec, 'Node specs need to adhere to certain format');
        t.end();
    });

    t.test('getLocation method', function(t) {
        t.plan(2);
        var node = new Node();
        t.equal(typeof node.getLocation, 'function', 'node.getLocation should be a function');
        node.mount(createMockNode(), 'body/1/2/3');
        t.equal(node.getLocation(), 'body/1/2/3', 'node.getLocation() should return path');
    });

    t.test('getId method', function(t) {
        var node = new Node();
        t.equal(node.getId, node.getLocation, 'node.getId should be alias for node.getLocation');
        t.end();
    });

    t.test('sendDrawCommand method', function(t) {
        var root = new Node();
        t.equal(typeof root.sendDrawCommand, 'function', 'root.sendDrawCommand should be a function');
        var receivedMessages = [];
        var context = {};
        context.getUpdater = function getUpdater () {
            return {
                message: function(message) {
                    receivedMessages.push(message);
                },
                requestUpdate: function() {
                    t.pass('should requestUpdate after being mounted to the context');
                }
            };
        };
        root.mount(context, 'body/0/1/2');
        var node0 = root.addChild();
        var node00 = node0.addChild();
        node00.sendDrawCommand('MESSAGE0');
        node00.sendDrawCommand('MESSAGE1');
        t.deepEqual(receivedMessages, ['MESSAGE0', 'MESSAGE1']);
        t.end();
    });

    t.test('getValue method', function(t) {
        var root = new Node();
        t.equal(typeof root.getValue, 'function', 'node.getValue should be a function');

        var context = {};
        var receivedMessages = [];
        var requesters = [];
        context.getUpdater = function getUpdater () {
            return {
                message: function message (element) {
                    receivedMessages.push(element);
                },
                requestUpdate: function requestUpdate (requester) {
                    requesters.push(requester);
                }
            };
        };
        root.mount(context, 'body');

        var node0 = root.addChild();
        var node1 = root.addChild();
        var node00 = node0.addChild();
        var node01 = node0.addChild();
        var node010 = node01.addChild();
        var node011 = node01.addChild();

        node0.setPosition(10, 20, 30);
        node0.setAlign(0.5, 0.1, 0.4);
        node0.setAbsoluteSize(100, 200, 300);

        node1.setPosition(40, 50, 60);
        node1.setMountPoint(0.1, 0.4, 0.3);
        node1.setOrigin(0.3, 0.9, 0.8);
        node1.setOpacity(0.4);
        node1.setDifferentialSize(10, 20, 30);

        node00.setPosition(5, 7, 8);
        node00.setOrigin(0.4, 0.1, 0.9);
        node00.setRotation(Math.PI*0.5, Math.PI*0.1, Math.PI*0.3);

        node01.setPosition(23, 13, 14);
        node01.setScale(0.5, 0.3, 0.4);

        node010.setPosition(12, 48, 43);
        node010.setSizeMode(Node.PROPORTIONAL_SIZE, Node.ABSOLUTE_SIZE, Node.DIFFERENTIAL_SIZE);
        node010.setProportionalSize(0.5, 0.4, 0.1);

        node011.setPosition(11, 93, 21);

        t.deepEqual(requesters.map(function (requester) {
            return requester.getLocation();
        }), [root, node0, node1, node00, node01, node010, node011].map(function (requester) {
            return requester.getLocation();
        }), 'Initial requests should be issued in predefined order');

        // TODO Compare to static JSON file

        t.end();
    });

    t.test('getComputedValue method', function(t) {
        var root = new Node();
        root.mount({
            getUpdater: function() {
                return {
                    requestUpdate: function() {
                    }
                };
            },
            getSize: function() {
                return [19000, 19000, 19000];
            },
            getTransform: function() {
                return IDENT;
            }
        }, 0);
        t.equal(typeof root.getComputedValue, 'function', 'root.getComputedValue should be a function');

        var node0 = root.addChild();
        var node1 = root.addChild();

        root.setSizeMode(Node.ABSOLUTE_SIZE, Node.ABSOLUTE_SIZE, Node.ABSOLUTE_SIZE);
        root.setAbsoluteSize(100, 200, 300);

        node0.mount(root, 0);
        node1.mount(root, 1);

        root.update(1);
        node0.update(0);

        t.deepEqual(
            node0.getComputedValue(),
            {
                children: [],
                computedValues: {
                    size: [100, 200, 300],
                    transform: IDENT
                },
                location: '0/0'
            }
        );

        t.end();
    });

    t.test('getChildren method', function(t) {
        var root = new Node();
        t.equal(typeof root.getChildren, 'function', 'root.getChildren should be a function');

        var node0 = root.addChild();
        var node1 = root.addChild();
        var node2 = root.addChild();

        var node10 = node1.addChild();
        var node11 = node1.addChild();

        t.deepEqual(root.getChildren(), [node0, node1, node2]);
        t.deepEqual(node0.getChildren(), []);
        t.deepEqual(node1.getChildren(), [node10, node11]);
        t.deepEqual(node2.getChildren(), []);

        t.end();
    });

    t.test('getParent method', function(t) {
        var parent = new Node();
        parent.mount(createMockNode(), 0);
        t.equal(typeof parent.getParent, 'function', 'parent.getParent should be a function');
        var child = parent.addChild();

        child.mount(parent);
        t.equal(child.getParent(), parent);
        t.end();
    });

    t.test('requestUpdate method', function(t) {
        t.plan(5);
        var requesters = [];

        var root = new Node();
        root.mount({
            getUpdater: function () {
                return {
                    requestUpdate: function (requester) {
                        requesters.push(requester);
                    }
                };
            }
        }, 'body');
        t.equal(typeof root.requestUpdate, 'function', 'root.requestUpdate should be a function');
        var node0 = root.addChild();

        // mount is requesting an update. We need to reset _requestingUpdate.
        node0.update(0);

        requesters.length = 0;

        var componentId = node0.addComponent({
            onUpdate: function(actualTime) {
                t.pass('should update a component when requesting an update');
                t.equal(actualTime, time);
            }
        });

        node0.requestUpdate(componentId);

        t.equal(
            requesters.length,
            1,
            'requestUpdate on a single component should only enqueue a single target node'
        );
        t.equal(
            requesters[0],
            node0,
            'requestUpdate should for specific component id should result into node being enqueued for next scene graph update'
        );

        var time = 123;
        node0.update(time);
    });

    t.test('requestUpdateOnNextTick method', function(t) {
        t.plan(1);
        var root = new Node();
        t.equal(typeof root.requestUpdateOnNextTick, 'function', 'root.requestUpdateOnNextTick should be a function');
    });

    t.test('getUpdater method', function(t) {
        var globalUpdater = {
            requestUpdate: function() {}
        };
        var context = {
            getUpdater: function() {
                return globalUpdater;
            }
        };

        var parent = new Node();
        parent.mount(context, 'body');

        var child = new Node();
        child.mount(parent, '0');

        t.equal(child.getUpdater(), globalUpdater);

        t.end();
    });

    t.test('isMounted method', function(t) {
        var child = new Node();
        t.equal(typeof child.isMounted, 'function', 'child.isMounted should be a function');
        t.equal(child.isMounted(), false, 'nodes should not be mounted when being initialized');

        child.mount({
            getUpdater: function() {
                return {
                    requestUpdate: function() {}
                };
            }
        }, 'body/0');

        t.equal(child.isMounted(), true, 'node.isMounted should indicate mounted state after node has been mounted');

        t.end();
    });

    t.test('isShown method', function(t) {
        var child = new Node();
        t.equal(typeof child.isShown, 'function', 'child.isShown should be a function');
        t.equal(child.isShown(), false, 'nodes should not be shown when being initialized');

        child.show();

        t.equal(child.isShown(), true, 'node.isShown should indicate shown state after node has been mounted');

        t.end();
    });

    t.test('getOpacity method', function(t) {
        var parent = new Node();
        parent.show();
        parent.onMount({
            getUpdater: function() {
                return {
                    requestUpdate: function() {}
                };
            },
            getSize: function() {
                return [19000, 19000, 19000];
            },
            getTransform: function() {
                return IDENT;
            }
        }, 'body');

        t.equal(typeof parent.getOpacity, 'function', 'parent.getOpacity should be a function');
        var child = new Node();
        child.onMount(parent, '0');

        parent.setOpacity(0.5);
        t.equal(parent.getOpacity(), 0.5);
        parent.onUpdate();
        child.onUpdate();
        t.equal(child.getOpacity(), 1, 'should not multiply opacities');

        t.end();
    });

    t.test('addChild, getChildren method', function(t) {
        var root = new Node();

        t.equal(typeof root.addChild, 'function', 'root.addChild should be a function');
        t.equal(typeof root.getChildren, 'function', 'root.getChildren should be a function');

        var child0 = root.addChild();
        var child00 = child0.addChild();
        var child01 = child0.addChild();

        var child1 = root.addChild();

        t.deepEqual(root.getChildren(), [child0, child1]);
        t.deepEqual(child0.getChildren(), [child00, child01]);
        t.end();
    });

    t.test('addChild, removeChild method', function(t) {
        var root = new Node();
        t.equal(typeof root.addChild, 'function', 'root.addChild should be a function');
        t.equal(typeof root.removeChild, 'function', 'root.removeChild should be a function');
        root.mount({
            getUpdater: function() {
                return {
                    requestUpdate: function() {}
                };
            }
        }, 'root');
        var node = root.addChild();
        t.equal(root.getChildren()[0], node);
        t.equal(root.getChildren().length, 1);
        root.removeChild(node);
        t.deepEqual(root.getChildren(), [null]);
        t.equal(root.getChildren().indexOf(node), -1);
        t.end();
    });

    t.test('addComponent method', function(t) {
        var root = new Node();
        t.equal(typeof root.addComponent, 'function', 'root.addComponent should be a function');

        var component = {
            onMount: function() {
            }
        };
        var componentId = root.addComponent(component);

        t.equal(typeof componentId, 'number', 'componentId returned by Node#addComponent should be a number');

        t.equal(
            root.getComponent(componentId),
            component,
            'root.addComponent should return componentId that can be used to retrieve the component later on using Node#getComponent'
        );

        t.end();
    });

    t.test('emit method', function(t) {
        var updater = {
            message: function() {
                return updater;
            },
            requestUpdate:function() {
            }
        };
        var root = new Scene('body', updater);

        var child0 = root.addChild();
        var child1 = root.addChild();
        var child00 = child0.addChild();
        var child01 = child0.addChild();
        var child000 = child00.addChild();

        t.equal(typeof root.emit, 'function', 'root.emit should be a function');

        var receivedEvents = [];

        function addEventListener(node) {
            node.addComponent({
                onReceive: function(type, ev) {
                    receivedEvents.push([type, ev, node]);
                }
            });
        }

        addEventListener(root);
        addEventListener(child0);
        addEventListener(child1);
        addEventListener(child00);
        addEventListener(child01);
        addEventListener(child000);

        var expectedType = 'type';
        var expectedEv = {};
        child000.emit(expectedType, expectedEv);

        t.deepEqual(receivedEvents.map(function(i) {
            return i[2].getId();
        }), [
            'body/0',
            'body/1',
            'body/0/0',
            'body/0/1',
            'body/0/0/0'
        ]);

        t.end();
    });

    t.test('setRotation', function (t) {
        t.comment(
            'Any mutation of a transform primitive is expected to result ' +
            'into onTransformChange event being propagated. The final, ' +
            'multiplied matrix will then be compared to a set of ' +
            'predefined, expected final transform matrices.'
        );

        t.test('basic (quaternions only)', function(t) {
            t.plan(6);

            var node = new Node();
            var identity = [0, 0, 0, 1];

            t.equal(
                typeof node.setRotation,
                'function',
                'node.setRotation should be a function'
            );

            t.deepEqual(
                node.getRotation(),
                identity,
                'Node\'s rotation vector should be the identity quaternion by ' +
                'default'
            );

            var root = new Node();
            root.onMount({
                getUpdater: function() {
                    return {
                        requestUpdate: function() {}
                    };
                }
            });
            node.onMount(root, 'body');

            node.addComponent({
                onTransformChange: function(transform) {
                    t.deepEqual(
                        transform,
                        expectedTransforms.shift(),
                        'node.setRotation should result into an appropriate ' +
                        'matrix multiplication'
                    );
                }
            });

            var expectedTransforms = [
                { 0: -25, 1: 46, 10: -39, 11: 0, 12: 0, 13: 0, 14: 0, 15: 1, 2: 4, 3: 0, 4: -14, 5: -49, 6: 52, 7: 0, 8: 44, 9: -28 },
                { 0: -79, 1: 64, 10: -121, 11: 0, 12: 0, 13: 0, 14: 0, 15: 1, 2: 8, 3: 0, 4: 56, 5: -57, 6: 34, 7: 0, 8: 32, 9: 14 },
                { 0: -9, 1: 54, 10: -169, 11: 0, 12: 0, 13: 0, 14: 0, 15: 1, 2: -18, 3: 0, 4: 18, 5: -163, 6: 166, 7: 0, 8: 54, 9: -158 },
                { 0: 1, 1: 0, 10: 1, 11: 0, 12: 0, 13: 0, 14: 0, 15: 1, 2: 0, 3: 0, 4: 0, 5: 1, 6: 0, 7: 0, 8: 0, 9: 0 }
            ];

            node.setRotation(4, 2, 3, 5).update();
            node.setRotation(5, 6, 2, 1).update();
            node.setRotation(9, 2, 1, 9).update();
            node.setRotation(0, 0, 0, 1).update();
        });

        t.test('switching between euler angles and quaternions', function(t) {
            t.plan(3);

            var node = new Node();

            var root = new Node();
            root.onMount({
                getUpdater: function() {
                    return {
                        requestUpdate: function() {}
                    };
                }
            });
            node.onMount(root, 'body');

            node.addComponent({
                onTransformChange: function(transform) {
                    t.deepEqual(
                        transform,
                        expectedTransforms.shift(),
                        'node.setRotation should result into an appropriate ' +
                        'matrix multiplication'
                    );
                }
            });

            t.comment(
                'This test case ensures that the conversion from quaternions ' +
                'to euler angles is correct.'
            );

            var expectedTransforms = [
                { 0: 0.55901700258255, 1: 0.7625707387924194, 10: 0.4156269133090973, 11: 0, 12: 0, 13: 0, 14: 0, 15: 1, 2: -0.3255546987056732, 3: 0, 4: -0.18163561820983887, 5: 0.4957217872142792, 6: 0.8492752313613892, 7: 0, 8: 0.80901700258255, 9: -0.4156269431114197 },
                { 0: 0.4755282700061798, 1: 0.8784343600273132, 10: 0.4156269133090973, 11: 0, 12: 0, 13: 0, 14: 0, 15: 1, 2: -0.04718049615621567, 3: 0, 4: -0.345491498708725, 5: 0.23581215739250183, 6: 0.9083107113838196, 7: 0, 8: 0.80901700258255, 9: -0.4156269431114197 },
                { 0: 0.55901700258255, 1: 0.7625707387924194, 10: 0.4156269133090973, 11: 0, 12: 0, 13: 0, 14: 0, 15: 1, 2: -0.3255546987056732, 3: 0, 4: -0.18163561820983887, 5: 0.4957217872142792, 6: 0.8492752313613892, 7: 0, 8: 0.80901700258255, 9: -0.4156269431114197 }
            ];

            node.setRotation(
                0.4023891896939372,
                0.36092862331592634,
                0.3003698248556209,
                0.7858698602217358
            ).update();

            t.comment(
                'Setting the same rotation in euler angles should not result ' +
                'into an update.'
            );

            node.setRotation(
                Math.PI*0.25,
                Math.PI*0.3,
                Math.PI*0.1
            ).update();

            t.comment(
                'Updating the rotation along the z axis without modifying x ' +
                'and y should result into update (euler angles).'
            );

            node.setRotation(
                null,
                null,
                Math.PI*0.2
            ).update();

            t.comment(
                'Switching back to initial rotation (quaternion).'
            );

            node.setRotation(
                0.4023891896939372,
                0.36092862331592634,
                0.3003698248556209,
                0.7858698602217358
            ).update();
        });
    });
});
