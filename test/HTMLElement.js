'use strict';

var test = require('tape');
var HTMLElement = require('../src/HTMLElement');

function noop() {}

function mockGetContext(matrix, size, opacity) {
    matrix = matrix == null ? new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]) : matrix;
    size = size == null ? [100, 100, 100] : size;
    opacity = opacity == null ? 1 : opacity;
    return function() {
        return {
            _transform: {
                _matrix: matrix
            },
            _size: {
                _size: [10, 20, 30]
            },
            _opacity: {
                value: 0.5
            }
        };    
    }
}

test('HTMLElement', function(t) {
    t.test('contructor', function(t) {
        t.plan(9);

        t.equal(typeof HTMLElement, 'function', 'HTMLElement should be a function');

        var dispatch = {
            _receivedDrawCommands: [],
            addRenderable: function() {
                t.pass('HTMLElement should register itself as a renderable');
            },
            onTransformChange: function() {
                t.pass('HTMLElement should listen for transformChange');
            },
            onSizeChange: function() {
                t.pass('HTMLElement should listen for sizeChange');
            },
            onOpacityChange: function() {
                t.pass('HTMLElement should listen for opacityChange');
            },
            getContext: mockGetContext(),
            dirtyRenderable: function() {
                t.pass('HTMLElement should dirty itself when registering with non-identity primitives');
            },
            sendDrawCommand: function(command) {
                this._receivedDrawCommands.push(command);
                return this;
            },
            getRenderPath: function() {
                return 'render/path';
            }
        };
        var el = new HTMLElement(dispatch);
        el.clean();

        t.deepEqual(
            dispatch._receivedDrawCommands, 
            [
                'WITH',
                'render/path',
                'DOM',
                'INIT_DOM',
                'div',
                'CHANGE_TRANSFORM',
                1,
                0,
                0,
                0,
                0,
                1,
                0,
                0,
                0,
                0,
                1,
                0,
                0,
                0,
                0,
                1,
                'CHANGE_SIZE',
                10,
                20,
                'CHANGE_PROPERTY',
                'opacity',
                0.5
            ]
        );
    });

    t.test('constructor invoked with custom options', function(t) {
        var dispatch = {
            _receivedDrawCommands: [],
            addRenderable: noop,
            onTransformChange: noop,
            onSizeChange: noop,
            onOpacityChange: noop,
            getContext: mockGetContext(),
            dirtyRenderable: noop,
            sendDrawCommand: function(command) {
                this._receivedDrawCommands.push(command);
                return this;
            },
            getRenderPath: function() {
                return 'render/path';
            }
        };
        var el = new HTMLElement(dispatch, {
            tagName: 'section',
            attributes: {
                attr1: 'attr1Val',
                attr2: 'attr2Val',
                attr3: 'attr3Val',
            },
            properties: {
                prop1: 'prop1Val',
                prop2: 'prop2Val',
                prop3: 'prop3Val',
            },
            id: '123',
            content: 'some content',
            classes: ['class1', 'class2']
        });
        el.clean();

        t.deepEqual(
            dispatch._receivedDrawCommands, 
            [
                'WITH',
                'render/path',
                'DOM',
                'INIT_DOM',
                'section',
                'CHANGE_TRANSFORM',
                1,
                0,
                0,
                0,
                0,
                1,
                0,
                0,
                0,
                0,
                1,
                0,
                0,
                0,
                0,
                1,
                'CHANGE_SIZE',
                10,
                20,
                'CHANGE_PROPERTY',
                'opacity',
                0.5,
                'ADD_CLASS',
                'class1',
                'ADD_CLASS',
                'class2',
                'CHANGE_ATTRIBUTE',
                'attr1',
                'attr1Val',
                'CHANGE_ATTRIBUTE',
                'attr2',
                'attr2Val',
                'CHANGE_ATTRIBUTE',
                'attr3',
                'attr3Val',
                'CHANGE_PROPERTY',
                'prop1',
                'prop1Val',
                'CHANGE_PROPERTY',
                'prop2',
                'prop2Val',
                'CHANGE_PROPERTY',
                'prop3',
                'prop3Val',
                'CHANGE_ATTRIBUTE',
                'id',
                '123',
                'CHANGE_CONTENT',
                'some content'
            ]
        );

        t.end();
    });
});
