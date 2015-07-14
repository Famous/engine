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

'use strict';

var test = require('tape');
var DOMRenderer = require('../DOMRenderer');

/**
 * Helpers method used for creating a mock compositor that fails on received
 * events. Used for ensuring that certain DOMRenderer methods don't (directly
 * or indirectly) trigger DOM events.
 *
 * @method createUnidirectionalCompositor
 * @private
 *
 * @param  {tape} t tape-test object
 * @return {Object} mock compositor
 */
function createUnidirectionalCompositor(t) {
    return {
        sendEvent: function () {
            t.fail('DOMRenderer should not send delegated events for a static DOM tree');
        }
    };
}

test('DOMRenderer', function(t) {
    t.test('basic insertEl', function(t) {
        var element = document.createElement('div');
        var selector = 'selector';
        element.classList.add(selector);
        var compositor = createUnidirectionalCompositor(t);
        var domRenderer = new DOMRenderer(element, selector, compositor);

        t.equal(typeof domRenderer.loadPath, 'function', 'domRenderer.loadPath should be a function');
        t.equal(typeof domRenderer.findTarget, 'function', 'domRender.findTarget should be a function');
        t.equal(typeof domRenderer.insertEl, 'function', 'domRender.setProperty should be a function');

        domRenderer.loadPath(selector + '/' + 0);
        domRenderer.insertEl('div');

        domRenderer.loadPath(selector + '/' + 1);
        domRenderer.insertEl('section');

        domRenderer.loadPath(selector + '/' + 2);
        domRenderer.insertEl('div');

        t.equal(element.children[0].tagName, 'DIV');
        t.equal(element.children[1].tagName, 'SECTION');
        t.equal(element.children[2].tagName, 'DIV');

        domRenderer.loadPath(selector + '/' + 1 + '/' + 0);
        domRenderer.insertEl('div');

        t.equal(element.children[1].children[0].tagName, 'DIV');

        domRenderer.loadPath(selector + '/' + 1 + '/' + 0 + '/' + 0);
        domRenderer.insertEl('div');

        t.equal(element.children[1].children[0].children[0].tagName, 'DIV');

        t.end();
    });

    t.test('insertEl with content', function(t) {
        var element = document.createElement('div');
        var selector = 'selector';
        var compositor = createUnidirectionalCompositor();
        var domRenderer = new DOMRenderer(element, selector, compositor);

        domRenderer.loadPath('selector/0/0/1');
        domRenderer.insertEl('div');

        t.equal(element.children.length, 1, 'domRenderer.insertEl should create a single DIV when no content is being set');
        t.equal(element.children[0].children.length, 0, 'domRenderer.insertEl should not create a separate content DIV by default');

        var content001 = 'hello world 1';
        domRenderer.setContent(content001);
        t.equal(element.children[0].children.length, 1, 'domRenderer.insertEl should wrap content in DIV');
        t.equal(element.children[0].children[0].innerHTML, 'hello world 1', 'domRenderer.insertEl should wrap content in DIV');

        t.end();
    });

    t.test('setProperty method', function(t) {
        var element = document.createElement('div');
        var selector = 'selector';
        element.classList.add(selector);
        var compositor = createUnidirectionalCompositor(t);
        var domRenderer = new DOMRenderer(element, selector, compositor);

        t.equal(typeof domRenderer.setProperty, 'function', 'domRenderer.setProperty should be a function');

        domRenderer.loadPath(selector + '/' + 1 + '/' + 0 + '/' + 0);
        domRenderer.insertEl('div');

        domRenderer.setProperty('background', 'red');
        t.equal(element.children[0].style.backgroundColor, 'red', 'domRenderer.setProperty should set the background color to red');

        domRenderer.setProperty('background', 'yellow');
        t.equal(element.children[0].style.backgroundColor, 'yellow', 'domRenderer.setProperty should set the background color to yellow');

        domRenderer.loadPath(selector + '/' + 1);
        domRenderer.insertEl('div');

        domRenderer.setProperty('background', 'green');
        t.equal(element.children[1].style.backgroundColor, 'green', 'domRenderer.setProperty should set the background color to green');

        domRenderer.setProperty('background', 'yellow');
        t.equal(element.children[0].style.backgroundColor, 'yellow', 'domRenderer.setProperty should set the background color to yellow');

        t.end();
    });

    t.test('setSize method', function(t) {
        var element = document.createElement('div');
        var selector = 'selector';
        element.classList.add(selector);
        var compositor = createUnidirectionalCompositor(t);
        var domRenderer = new DOMRenderer(element, selector, compositor);

        t.equal(typeof domRenderer.setSize, 'function', 'domRenderer.setSize should be a function');

        domRenderer.loadPath(selector + '/' + 0);
        domRenderer.insertEl('div');
        domRenderer.setSize(200, 100);

        t.equal(element.children[0].style.width, 200 + 'px', 'domRenderer.setSize should set the element width in pixels');
        t.equal(element.children[0].style.height, 100 + 'px', 'domRenderer.setSize should set the element height in pixels');

        t.end();
    });

    t.test('setAttribute method', function(t) {
        var element = document.createElement('div');
        var selector = 'selector';
        element.classList.add(selector);
        var compositor = createUnidirectionalCompositor(t);
        var domRenderer = new DOMRenderer(element, selector, compositor);

        t.equal(typeof domRenderer.setAttribute, 'function', 'domRenderer.setSize should be a function');

        domRenderer.loadPath(selector + '/' + 0);
        domRenderer.insertEl('div');

        domRenderer.setAttribute('id', 'id-value');
        t.equal(element.children[0].getAttribute('id'), 'id-value', 'domRenderer.setAttribute should set the element id');

        t.end();
    });

    t.test('setContent method', function(t) {
        var element = document.createElement('div');
        var selector = 'selector';
        element.classList.add(selector);
        var compositor = createUnidirectionalCompositor(t);
        var domRenderer = new DOMRenderer(element, selector, compositor);

        t.equal(typeof domRenderer.setContent, 'function', 'domRenderer.setContent should be a function');

        domRenderer.loadPath(selector + '/' + 0);
        domRenderer.insertEl('div');

        domRenderer.setContent('only text');
        t.equal(element.children[0].children[0].constructor, HTMLDivElement, 'DOMRenderer should wrap content into content div');
        t.equal(element.children[0].children[0].innerHTML, 'only text');

        domRenderer.setContent('also <strong>HTML</strong> should work');
        t.equal(element.children[0].children[0].innerHTML, 'also <strong>HTML</strong> should work');

        domRenderer.setContent('combined <strong>HTML</strong> and nodes <section></section>');
        domRenderer.loadPath(selector + '/' + 0 + '/' + 1);
        domRenderer.insertEl('section');
        t.equal(element.children[0].children[0].innerHTML, 'combined <strong>HTML</strong> and nodes <section></section>');

        t.end();
    });

    t.test('addClass/ removeClass method', function(t) {
        var element = document.createElement('div');
        var selector = 'selector';
        element.classList.add(selector);
        var compositor = createUnidirectionalCompositor(t);
        var domRenderer = new DOMRenderer(element, selector, compositor);

        t.equal(typeof domRenderer.addClass, 'function', 'domRenderer.addClass should be a function');
        t.equal(typeof domRenderer.removeClass, 'function', 'domRenderer.removeClass should be a function');

        domRenderer.loadPath(selector + '/' + 0 + '/' + 1);
        domRenderer.insertEl('div');

        domRenderer.addClass('some-class');
        t.ok(element.children[0].classList.contains('some-class'), 'domRenderer.addClass should add a class');

        domRenderer.removeClass('some-class');
        t.notOk(element.children[0].classList.contains('some-class'), 'domRenderer.removeClass should remove a class');

        t.end();
    });

    t.test('findParent method', function(t) {
        var element = document.createElement('div');
        var selector = 'selector';
        element.classList.add(selector);
        var compositor = createUnidirectionalCompositor(t);
        var domRenderer = new DOMRenderer(element, selector, compositor);

        t.equal(typeof domRenderer.findParent, 'function', 'domRenderer.findParent should be a function');

        domRenderer.loadPath(selector + '/' + 0);
        domRenderer.insertEl('div');

        t.equal(domRenderer.findParent().path, selector);

        domRenderer.loadPath(selector + '/' + 0 + '/' + 1);
        domRenderer.insertEl('section');

        t.equal(domRenderer.findParent().path, selector + '/' + 0);

        t.end();
    });

    t.test('_triggerEvent method', function(t) {
        var element = document.createElement('div');
        var selector = 'selector';
        var sentEvents = [];

        var compositor = {
            sendEvent: function (path, ev, payload) {
                sentEvents.push([path, ev, payload]);
            }
        };

        var domRenderer = new DOMRenderer(element, selector, compositor);

        domRenderer.loadPath(selector + '/' + 0);
        domRenderer.insertEl('div');

        domRenderer.loadPath(selector + '/' + 0 + '/' + 1);
        domRenderer.insertEl('div');

        domRenderer.subscribe('click');

        domRenderer.loadPath(selector + '/' + 0 + '/' + 1 + '/' + 0);
        domRenderer.insertEl('div');

        domRenderer.subscribe('click');

        var ev1 = {
            type: 'click',
            target: {},
            path: [
                { dataset: { faPath: selector + '/' + 0 + '/' + 1 + '/' + 0 } },
                { dataset: { faPath: selector + '/' + 0 + '/' + 1 } },
                { dataset: { faPath: selector + '/' + 0 } }
            ],
            stopPropagation: function() {
                t.fail('domRenderer._triggerEvent should not stopPropagation of DOM event');
            }
        };

        domRenderer._triggerEvent(ev1);

        t.deepEqual(
            sentEvents[0].slice(0, 2),
            [ selector + '/' + 0 + '/' + 1 + '/' + 0, ev1.type ],
            'domRenderer._triggerEvent should emit correct event on leaf node'
        );

        sentEvents.length = 0;

        domRenderer._triggerEvent(ev1);

        t.equal(sentEvents.length, 0, 'domRenderer._triggerEvent should not emit same event multiple times in a row');

        t.end();
    });

    t.test('Man in the middle insertion', function(t) {
        var element = document.createElement('div');
        var selector = 'selector';
        var compositor = createUnidirectionalCompositor();
        var domRenderer = new DOMRenderer(element, selector, compositor);

        domRenderer.loadPath('selector/0/0/1');
        domRenderer.insertEl('div');
        domRenderer.setAttribute('data-fa-path', 'selector/0/0/1');

        t.equal(element.children.length, 1, 'domRenderer.insertEl should create a single DIV when no content is being set');
        t.equal(element.children[0].children.length, 0, 'domRenderer.insertEl should not create a separate content DIV by default');

        domRenderer.loadPath('selector/0');
        domRenderer.insertEl('section');
        domRenderer.setAttribute('data-fa-path', 'selector/0');

        t.equal(element.children.length, 1, 'domRenderer.insertEl should insert second element in between root element and leaf node');
        t.equal(element.children[0].tagName.toUpperCase(), 'SECTION', 'domRenderer.insertEl should insert using correct tagName');

        t.equal(element.children[0].children.length, 1, 'domRenderer.insertEl should insert new element in between that has the previous leaf node as a child');
        t.equal(element.children[0].children[0].tagName.toUpperCase(), 'DIV', 'domRenderer.insertEl should preserve tagName of previously inserted leaf node');

        domRenderer.loadPath('selector/0/1');
        domRenderer.insertEl('span');
        domRenderer.setAttribute('data-fa-path', 'selector/0/1');

        t.equal(element.children[0].children.length, 2, 'domRenderer.insertEl should insert sibling');
        t.equal(element.children[0].children[1].tagName.toUpperCase(), 'SPAN', 'domRenderer.insertEl should insert sibling using correct tagName');
        t.equal(element.children[0].children[1].children.length, 0, 'domRenderer.insertEl should insert sibling as leaf node');

        domRenderer.loadPath('selector/0');
        domRenderer.setContent('hello world');

        t.equal(element.children[0].children.length, 3, 'domRenderer.insertEl should preserve correct DOM nesting when wrapping content');

        t.end();
    });
});
