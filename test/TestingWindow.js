'use strict';

function ClassList(element) {
    this._classes = [];
    this._element = element;
}

ClassList.prototype.add = function add(className) {
    this._classes.push(className);

    this._element.className += (' ' + className);
}

function DOMElement(tagName) {
    this.style = {};
    this.tagName = tagName;
    this.className = '';
    this.id;
    this._children = [];
    this.classList = new ClassList(this);
}

DOMElement.prototype.appendChild = function(element) {
    return this._children.push(element);
}

function Document() {
    this.body = new DOMElement('body');
}

Document.prototype.createElement = function(tagName) {
    return new DOMElement(tagName);
};

Document.prototype.querySelector = function(selector) {
    var element;
    var target;
    var result;


    switch (selector[0]) {
        case '#': target = 'id'; result = selector.slice(1); break;
        case '.': target = 'class'; result = selector.slice(1); break;
        default:  target = 'tagName'; result = selector; break;
    }

    _traverse(this.body, function(node) {
        if (node[target] === result) element = node;
    });

    return element;
};

function _traverse(node, cb) {
    var i = node._children.length;
    var child;

    cb(node);

    while (i--) _traverse(node._children[i], cb);
}

module.exports = {
    document: new Document(),

    addEventListener: function(ev, cb) {},
};