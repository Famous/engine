'use strict';

function DOMElement(tagName) {
    this.style = {};
    this.tagName = tagName;
    this._children = [];
}

DOMElement.prototype.appendChild = function(element) {
    return this._children.push(element);
}

function Document() {
    this.body = new DOMElement();
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

    return _traverse(this.body, function(node) {
        if (node[target] === result) element = node;
    });

    return element;
};

function _traverse(node, cb) {
    var i = node._children.length;
    var child;
    console.log(node._children)

    while (i--) {
        var child = node._children[i];
        console.log(child)
        cb(child);
        if (child._children[i].length) {
            _traverse(child);
        }
    }
}

module.exports = {
    document: new Document()
};