'use strict';

var LocalDispatch = require('./LocalDispatch');

/**
 * Nodes define hierarchy in the scene graph.
 *
 * @class  Node
 * @constructor
 * 
 * @param {RenderProxy}     [proxy]             proxy used for creating a new
 *                                              LocalDispatch if none has been provided
 * @param {GlobalDispatch}  globalDispatch      GlobalDispatch consecutively
 *                                              passed down from the Context
 * @param {LocalDispatch}   [localDispatch]     LocalDispatch
 */
function Node (proxy, globalDispatch, localDispatch) {
    this._localDispatch = localDispatch != null ? localDispatch : new LocalDispatch(this, proxy);
    this._globalDispatch = globalDispatch;
    this._children = [];
}

/**
 * Adds a child at the specified index. If index is `undefined`, the child
 * will be pushed to the end of the internal children array.
 *
 * @method  addChild
 * @chainable
 * 
 * @param   {Number} [index]    index the child should be inserted at
 * @return  {Node} added        new child node
 */
Node.prototype.addChild = function addChild (index) {
    var child = new this.constructor(this._localDispatch.getRenderProxy(), this._globalDispatch);
    if (index == null) this._children.push(child);
    else this._children.splice(index, 0, child);
    return child;
};

/**
 * Removes the passed in node from the node's children. If the node is not an
 * immediate child of the node the method is being called on, the method will
 * fail silently.
 *
 * @method  removeChild
 * @chainable
 * 
 * @param  {Node} node   child node to be removed
 * @return {Node}        this
 */
Node.prototype.removeChild = function removeChild (node) {
    var index = this._children.indexOf(node);
    if (index !== -1) {
        var result = this._children.splice(index, 1);
        result[0].kill();
    }
    return this;
};

/**
 * Removes the child node at the specified index. E.g. removeChild(0) removes
 * the node's first child, which consequently changes all remanining indices.
 *
 * @method  removeChildAtIndex
 * @chainable
 * 
 * @param  {Number} index index of the node to be removed in the internal
 *                        children array
 * @return {Node}       this
 */
Node.prototype.removeChildAtIndex = function removeChildAtIndex (index) {
    var result = this._children.splice(index, 1);
    if (result.length) result[0].kill();
    return this;
};

/**
 * Removes all children attached to this node.
 *
 * @method  removeAllChildren
 * @chainable
 * 
 * @return {Node} this
 */
Node.prototype.removeAllChildren = function removeAllChildren () {
    for (var i = 0, len = this._children.length ; i < len ; i++) {
        this._children.pop().kill();
    }
    return this;
};

/**
 * Kills the Node by killing its local dispatch and removing all its children.
 * Used internally whenever a child is being removed.
 * 
 * @method  kill
 * @chainable
 * @private
 * 
 * @return {Node} this
 */
Node.prototype.kill = function kill () {
    this._localDispatch.kill();
    this.removeAllChildren();
    return this;
};

/**
 * Returns the local dispatch attached to this node.
 *
 * @method  getDispatch
 * 
 * @return {LocalDispatch} dispatch
 */
Node.prototype.getDispatch = function getDispatch () {
    return this._localDispatch;
};


/**
 * Returns the Node's children.
 *
 * @method getChildren
 * 
 * @return {Node[]} children of this Node
 */
Node.prototype.getChildren = function getChildren () {
    return this._children;
};

/**
 * Recursively updates the node and all its children.
 *
 * @method  update
 * @chainable
 * 
 * @param  {Node} parent    parent node
 * @return {Node}           this
 */
Node.prototype.update = function update (parent) {
    this._localDispatch.update(parent);
    for (var i = 0, len = this._children.length ; i < len ; i++)
        this._children[i].update(this);
    return this;
};

module.exports = Node;
