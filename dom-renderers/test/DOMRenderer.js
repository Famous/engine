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
 * Helpers method used for creating a mock compostior that fails on received
 * events. Used for ensuring that certain DOMRenderer methods don't (directly
 * or indirectly) trigger DOM events.
 *
 * @method createUnidirectionalCompositor
 * @private
 *
 * @param  {tape} t tape-test object
 * @return {Object} mock compostior
 */
function createUnidirectionalCompositor(t) {
    return {
        sendEvent: function () {
            t.fail('DOMRenderer should not send delegated events for a static DOM tree');
        }
    };
}

test('DOMRenderer', function(t) {
    t.test('basic DOM insertions', function(t) {
        var element = document.createElement('div');
        var selector = 'selector';
        element.classList.add(selector);
        var compositor = createUnidirectionalCompositor(t);
        var domRenderer = new DOMRenderer(element, selector, compositor);

        t.equal(typeof domRenderer.loadPath, 'function', 'domRenderer.loadPath should be a function');
        t.equal(typeof domRenderer.findTarget, 'function', 'domRender.findTarget should be a function');
        t.equal(typeof domRenderer.insertEl, 'function', 'domRender.setProperty should be a function');

        domRenderer.loadPath(selector + '/' + 0);
        domRenderer.findTarget();
        domRenderer.insertEl('div');

        domRenderer.loadPath(selector + '/' + 1);
        domRenderer.findTarget();
        domRenderer.insertEl('section');

        domRenderer.loadPath(selector + '/' + 2);
        domRenderer.findTarget();
        domRenderer.insertEl('div');

        t.equal(element.children[0].tagName, 'DIV');
        t.equal(element.children[1].tagName, 'SECTION');
        t.equal(element.children[2].tagName, 'DIV');

        domRenderer.loadPath(selector + '/' + 1 + '/' + 0);
        domRenderer.findTarget();
        domRenderer.insertEl('div');

        t.equal(element.children[1].children[0].tagName, 'DIV');

        domRenderer.loadPath(selector + '/' + 1 + '/' + 0 + '/' + 0 + '/' + 0);
        domRenderer.findTarget();
        domRenderer.insertEl('div');

        t.equal(element.children[1].children[0].children[0].tagName, 'DIV');

        domRenderer.loadPath(selector + '/' + 1 + '/' + 0 + '/' + 0);
        domRenderer.findTarget();
        domRenderer.insertEl('section');

        t.equal(element.children[1].children[0].children[0].tagName, 'SECTION', 'injecting a SECTION between a parent and a child node');
        t.equal(element.children[1].children[0].children[0].children[0].tagName, 'DIV', 'original child should not become child of injected node');

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
        domRenderer.findTarget();
        domRenderer.insertEl('div');

        domRenderer.setProperty('background', 'red');
        t.equal(element.children[0].style.backgroundColor, 'red', 'domRenderer.setProperty should set the background color to red');

        domRenderer.setProperty('background', 'yellow');
        t.equal(element.children[0].style.backgroundColor, 'yellow', 'domRenderer.setProperty should set the background color to yellow');

        domRenderer.loadPath(selector + '/' + 1);
        domRenderer.findTarget();
        domRenderer.insertEl('div');

        domRenderer.setProperty('background', 'green');
        t.equal(element.children[0].style.backgroundColor, 'green', 'domRenderer.setProperty should set the background color to green');

        domRenderer.setProperty('background', 'yellow');
        t.equal(element.children[0].children[0].style.backgroundColor, 'yellow', 'domRenderer.setProperty should set the background color to yellow');

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
        domRenderer.findTarget();
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
        domRenderer.findTarget();
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
        domRenderer.findTarget();
        domRenderer.insertEl('div');

        domRenderer.setContent('only text');
        t.equal(element.children[0].children[0].constructor, HTMLDivElement, 'DOMRenderer should wrap content into content div');
        t.equal(element.children[0].children[0].innerHTML, 'only text');

        domRenderer.setContent('also <strong>HTML</strong> should work');
        t.equal(element.children[0].children[0].innerHTML, 'also <strong>HTML</strong> should work');

        domRenderer.setContent('combined <strong>HTML</strong> and nodes <section></section>');
        domRenderer.loadPath(selector + '/' + 0 + '/' + 1);
        domRenderer.findTarget();
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
        domRenderer.findTarget();
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
        domRenderer.findTarget();
        domRenderer.insertEl('div');

        t.equal(domRenderer.findParent().path, selector);

        domRenderer.loadPath(selector + '/' + 0 + '/' + 1);
        domRenderer.findTarget();
        domRenderer.insertEl('section');

        t.equal(domRenderer.findParent().path, selector + '/' + 0);

        t.end();
    });

    t.test('getSize method', function(t) {
        var element = document.createElement('div');
        var selector = 'selector';
        element.classList.add(selector);
        var compositor = createUnidirectionalCompositor(t);
        var domRenderer = new DOMRenderer(element, selector, compositor);

        t.equal(typeof domRenderer.getSize, 'function', 'domRenderer.getSize should be a function');

        domRenderer.loadPath(selector + '/' + 0);
        domRenderer.findTarget();
        domRenderer.insertEl('div');

        domRenderer.setSize(true, true);
        domRenderer.setContent('some content');

        document.body.appendChild(element);
        t.notDeepEqual(domRenderer.getSize(), [0, 0]);

        document.body.removeChild(element);

        t.end();
    });
});
