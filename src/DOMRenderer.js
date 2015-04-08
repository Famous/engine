'use strict';

function DOMRenderer (element, selector) {
    this._target = null;
    this._parent = null;
    this._children = [];
    this._root = element;
    this._selector = selector;
    this._elements = {
        selector: this._root 
    };
}

DOMRenderer.prototype.findParent = function findParent (path) {
    var parent;
    while (!parent && path.length) {
        path = path.substring(0, path.lastIndexOf('/'));
        parent = this._elements[path];
    }
    this._parent = parent;
    return parent;
};

DOMRenderer.prototype.findChildren = function findChildren (path) {
    var keys = Object.keys(this._elements);
    var i = 0;
    while (i < keys.length) {
        if (keys[i].indexOf(path) === -1 || keys[i] === path) keys.splice(i, 1);
        else i++;
    }
    var currentPath;
    var j = 0;
    for (i = 0 ; i < keys.length ; i++) {
        currentPath = keys[i];
        for (j = 0 ; j < keys.length ; j++) {
            if (i !== j && keys[j].indexOf(currentPath) !== -1) {
                keys.splice(j, 1);
                i--;
            }
        }
    }
    for (i = 0, len = keys.length ; i < len ; i++)
        this._children[i] = this._elements[keys[i]];

    return this._children;
};

DOMRenderer.prototype.findTarget = function findTarget (path) {
    this._target = this._elements[path];
    return this._target;
};

DOMRenderer.prototype.

DOMRenderer.prototype.insertEl = function insertEl (path, tagName) {
    if (!this.findTarget(path) ||
         this._target.tagName.toLowerCase() === tagName.toLowerCase()) {
        this.findParent(path);
        this.findChildren(path);
        if (this._target) this._parent.removeChild(this._target);
        this._target = document.createElement(tagName);
        this._parent.appendChild(this._target);
        for (var i = 0, len = this._children.length ; i < len ; i++) {
            this._target.appendChild(this._children[i]);
        }
    }
};

DOMRenderer.prototype.

