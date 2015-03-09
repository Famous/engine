'use strict';

var DEALLOCATION_ERROR = new Error('Can\'t deallocate non-allocated element');

/**
 * Internal helper object to Container that handles the process of
 *   creating and allocating DOM elements within a managed div.
 *   Private.
 *
 * @class ElementAllocator
 * @constructor
 *
 * @param {DOMElement} container document element in which Famo.us content will be inserted
 */
function ElementAllocator(container) {
    if (!container) container = document.createDocumentFragment();
    this._container = container;
    this._nodeCount = 0;

    this._allocatedNodes = {};
    this._deallocatedNodes = {};
}

/**
 * Allocate an element of specified type from the pool.
 *
 * @method allocate
 *
 * @param {String} type type of element, e.g. 'div'
 *
 * @return {DOMElement} allocated document element
 */
ElementAllocator.prototype.allocate = function allocate(type) {
    type = type.toLowerCase();
    var result;
    var nodeStore = this._deallocatedNodes[type];
    if (nodeStore && nodeStore.length > 0) {
        result = nodeStore.pop();
    }
    else {
        result = document.createElement(type);
        this._container.appendChild(result);
        this._allocatedNodes[type] = this._allocatedNodes[type] ? this._allocatedNodes[type] : [];
        this._allocatedNodes[type].push(result);
    }
    this._nodeCount++;
    result.style.display = '';
    return result;
};

/**
 * De-allocate an element of specified type to the pool.
 *
 * @method deallocate
 *
 * @param {DOMElement} element document element to deallocate
 */
ElementAllocator.prototype.deallocate = function deallocate(element) {
    var type = element.nodeName.toLowerCase();
    this._deallocatedNodes[type] = this._deallocatedNodes[type] ? this._deallocatedNodes[type] : [];
    var allocatedNodeStore = this._allocatedNodes[type];
    var deallocatedNodeStore = this._deallocatedNodes[type];
    if (!allocatedNodeStore) throw DEALLOCATION_ERROR;
    var index = allocatedNodeStore.indexOf(element);
    if (index === -1) throw DEALLOCATION_ERROR;
    allocatedNodeStore.splice(index, 1);
    deallocatedNodeStore.push(element);

    this._nodeCount--;
};

ElementAllocator.prototype.setContainer = function setContainer(container) {
    this._container = container;

    var nodeType, i;
    for (nodeType in this._deallocatedNodes) {
        for (i = 0; i < this._deallocatedNodes[nodeType].length; i++) {
            this._container.appendChild(this._deallocatedNodes[nodeType][i]);
        }
        for (i = 0; i < this._allocatedNodes[nodeType].length; i++) {
            this._container.appendChild(this._allocatedNodes[nodeType][i]);
        }
    }
};


ElementAllocator.prototype.getContainer = function getContainer() {
    return this._container;
};

/**
 * Get count of total allocated nodes in the document.
 *
 * @method getNodeCount
 *
 * @return {Number} total node count
 */
ElementAllocator.prototype.getNodeCount = function getNodeCount() {
    return this._nodeCount;
};

module.exports = ElementAllocator;
