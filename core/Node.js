/*
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

var SizeSystem = require('./SizeSystem');
var Dispatch = require('./Dispatch');
var TransformSystem = require('./TransformSystem');
var OpacitySystem = require('./OpacitySystem');
var Size = require('./Size');
var Opacity = require('./Opacity');
var Transform = require('./Transform');

/**
 * Nodes define hierarchy and geometrical transformations. They can be moved
 * (translated), scaled and rotated.
 *
 * A Node is either mounted or unmounted. Unmounted nodes are detached from the
 * scene graph. Unmounted nodes have no parent node, while each mounted node has
 * exactly one parent. Nodes have an arbitrary number of children, which can be
 * dynamically added using {@link Node#addChild}.
 *
 * Each Node has an arbitrary number of `components`. Those components can
 * send `draw` commands to the renderer or mutate the node itself, in which case
 * they define behavior in the most explicit way. Components that send `draw`
 * commands are considered `renderables`. From the node's perspective, there is
 * no distinction between nodes that send draw commands and nodes that define
 * behavior.
 *
 * Because of the fact that Nodes themself are very unopinioted (they don't
 * "render" to anything), they are often being subclassed in order to add e.g.
 * components at initialization to them. Because of this flexibility, they might
 * as well have been called `Entities`.
 *
 * @example
 * // create three detached (unmounted) nodes
 * var parent = new Node();
 * var child1 = new Node();
 * var child2 = new Node();
 *
 * // build an unmounted subtree (parent is still detached)
 * parent.addChild(child1);
 * parent.addChild(child2);
 *
 * // mount parent by adding it to the context
 * var context = Famous.createContext("body");
 * context.addChild(parent);
 *
 * @class Node
 * @constructor
 */
function Node () {
    this._requestingUpdate = false;
    this._inUpdate = false;
    this._mounted = false;
    this._shown = true;
    this._updater = null;
    this._UIEvents = [];

    this._updateQueue = [];
    this._nextUpdateQueue = [];

    this._freedComponentIndicies = [];
    this._components = [];

    this._freedChildIndicies = [];
    this._children = [];

    this._fullChildren = [];

    this._parent = null;

    this._id = null;

    this._transformID = null;
    this._sizeID = null;
    this._opacityID = null;

    if (!this.constructor.NO_DEFAULT_COMPONENTS) this._init();
}

Node.RELATIVE_SIZE = 0;
Node.ABSOLUTE_SIZE = 1;
Node.RENDER_SIZE = 2;
Node.DEFAULT_SIZE = 0;
Node.NO_DEFAULT_COMPONENTS = false;

/**
 * Protected method. Initializes a node with a default Transform and Size component
 *
 * @method
 * @protected
 *
 * @return {undefined} undefined
 */
Node.prototype._init = function _init () {
    this._transformID = this.addComponent(new Transform());
    this._sizeID = this.addComponent(new Size());
    this._opacityID = this.addComponent(new Opacity());
};

/**
 * Protected method. Sets the parent of this node such that it can be looked up.
 *
 * @method
 *
 * @param {Node} parent The node to set as the parent of this
 *
 * @return {undefined} undefined;
 */
Node.prototype._setParent = function _setParent (parent) {
    if (this._parent && this._parent.getChildren().indexOf(this) !== -1) {
        this._parent.removeChild(this);
    }
    this._parent = parent;
};

/**
 * Protected method. Sets the mount state of the node. Should only be called
 * by the dispatch
 *
 * @method
 *
 * @param {Boolean} mounted whether or not the Node is mounted.
 * @param {String} path The path that the node will be mounted to
 *
 * @return {undefined} undefined
 */
Node.prototype._setMounted = function _setMounted (mounted, path) {
    this._mounted = mounted;
    this._id = path ? path : null;
};

/**
 * Protected method, sets whether or not the Node is shown. Should only
 * be called by the dispatch
 *
 * @method
 *
 * @param {Boolean} shown whether or not the node is shown
 *
 * @return {undefined} undefined
 */
Node.prototype._setShown = function _setShown (shown) {
    this._shown = shown;
};

/**
 * Protected method. Sets the updater of the node.
 *
 * @method
 *
 * @param {FamousEngine} updater the Updater of the node.
 *
 * @return {undefined} undefined
 */
Node.prototype._setUpdater = function _setUpdater (updater) {
    this._updater = updater;
    if (this._requestingUpdate) this._updater.requestUpdate(this);
};

/**
 * Determine the node's location in the scene graph hierarchy.
 * A location of `body/0/1` can be interpreted as the following scene graph
 * hierarchy (ignoring siblings of ancestors and additional child nodes):
 *
 * `Context:body` -> `Node:0` -> `Node:1`, where `Node:1` is the node the
 * `getLocation` method has been invoked on.
 *
 * @method getLocation
 *
 * @return {String} location (path), e.g. `body/0/1`
 */
Node.prototype.getLocation = function getLocation () {
    return this._id;
};

/**
 * @alias getId
 *
 * @return {String} the path of the Node
 */
Node.prototype.getId = Node.prototype.getLocation;

/**
 * Dispatches the event using the Dispatch. All descendent nodes will
 * receive the dispatched event.
 *
 * @method emit
 *
 * @param  {String} event   Event type.
 * @param  {Object} payload Event object to be dispatched.
 *
 * @return {Node} this
 */
Node.prototype.emit = function emit (event, payload) {
    Dispatch.dispatch(this.getLocation(), event, payload);
    return this;
};

// THIS WILL BE DEPRECATED
Node.prototype.sendDrawCommand = function sendDrawCommand (message) {
    this._updater.message(message);
    return this;
};

/**
 * Recursively serializes the Node, including all previously added components.
 *
 * @method getValue
 *
 * @return {Object}     Serialized representation of the node, including
 *                      components.
 */
Node.prototype.getValue = function getValue () {
    var numberOfChildren = this._children.length;
    var numberOfComponents = this._components.length;
    var i = 0;

    var value = {
        location: this.getId(),
        spec: {
            location: this.getId(),
            showState: {
                mounted: this.isMounted(),
                shown: this.isShown(),
                opacity: 1
            },
            offsets: {
                mountPoint: [0, 0, 0],
                align: [0, 0, 0],
                origin: [0, 0, 0]
            },
            vectors: {
                position: [0, 0, 0],
                rotation: [0, 0, 0, 1],
                scale: [1, 1, 1]
            },
            size: {
                sizeMode: [0, 0, 0],
                proportional: [1, 1, 1],
                differential: [0, 0, 0],
                absolute: [0, 0, 0],
                render: [0, 0, 0]
            }
        },
        UIEvents: this._UIEvents,
        components: [],
        children: []
    };

    if (value.location) {
        var transform = TransformSystem.get(this.getId());
        var size = SizeSystem.get(this.getId());
        var opacity = OpacitySystem.get(this.getId());

        value.spec.showState.opacity = opacity.getOpacity();

        for (i = 0 ; i < 3 ; i++) {
            value.spec.offsets.mountPoint[i] = transform.offsets.mountPoint[i];
            value.spec.offsets.align[i] = transform.offsets.align[i];
            value.spec.offsets.origin[i] = transform.offsets.origin[i];
            value.spec.vectors.position[i] = transform.vectors.position[i];
            value.spec.vectors.rotation[i] = transform.vectors.rotation[i];
            value.spec.vectors.scale[i] = transform.vectors.scale[i];
            value.spec.size.sizeMode[i] = size.sizeMode[i];
            value.spec.size.proportional[i] = size.proportionalSize[i];
            value.spec.size.differential[i] = size.differentialSize[i];
            value.spec.size.absolute[i] = size.absoluteSize[i];
            value.spec.size.render[i] = size.renderSize[i];
        }

        value.spec.vectors.rotation[3] = transform.vectors.rotation[3];
    }

    for (i = 0; i < numberOfChildren ; i++)
        if (this._children[i] && this._children[i].getValue)
            value.children.push(this._children[i].getValue());

    for (i = 0 ; i < numberOfComponents ; i++)
        if (this._components[i] && this._components[i].getValue)
            value.components.push(this._components[i].getValue());

    return value;
};

/**
 * Similar to {@link Node#getValue}, but returns the actual "computed" value. E.g.
 * a proportional size of 0.5 might resolve into a "computed" size of 200px
 * (assuming the parent has a width of 400px).
 *
 * @method getComputedValue
 *
 * @return {Object}     Serialized representation of the node, including
 *                      children, excluding components.
 */
Node.prototype.getComputedValue = function getComputedValue () {
    console.warn('Node.getComputedValue is depricated. Use Node.getValue instead');
    var numberOfChildren = this._children.length;

    var value = {
        location: this.getId(),
        computedValues: {
            transform: this.isMounted() ? TransformSystem.get(this.getLocation()).getLocalTransform() : null,
            size: this.isMounted() ? SizeSystem.get(this.getLocation()).get() : null,
            opacity: this.isMounted() ? OpacitySystem.get(this.getLocation()).get() : null
        },
        children: []
    };

    for (var i = 0 ; i < numberOfChildren ; i++)
        if (this._children[i] && this._children[i].getComputedValue)
            value.children.push(this._children[i].getComputedValue());

    return value;
};

/**
 * Retrieves all children of the current node.
 *
 * @method getChildren
 *
 * @return {Array.<Node>}   An array of children.
 */
Node.prototype.getChildren = function getChildren () {
    return this._fullChildren;
};

/**
 * Method used internally to retrieve the children of a node. Each index in the
 * returned array represents a path fragment.
 *
 * @method getRawChildren
 * @private
 *
 * @return {Array}  An array of children. Might contain `null` elements.
 */
Node.prototype.getRawChildren = function getRawChildren() {
    return this._children;
};

/**
 * Retrieves the parent of the current node. Unmounted nodes do not have a
 * parent node.
 *
 * @method getParent
 *
 * @return {Node}       Parent node.
 */
Node.prototype.getParent = function getParent () {
    return this._parent;
};

/**
 * Schedules the {@link Node#update} function of the node to be invoked on the
 * next frame (if no update during this frame has been scheduled already).
 * If the node is currently being updated (which means one of the requesters
 * invoked requestsUpdate while being updated itself), an update will be
 * scheduled on the next frame by falling back to the `requestUpdateOnNextTick`
 * function.
 *
 * Components request their `onUpdate` method to be called during the next
 * frame using this method.
 *
 * @method requestUpdate
 *
 * @param  {Number} requester   Id of the component (as returned by
 *                              {@link Node#addComponent}) to be updated. The
 *                              component's `onUpdate` method will be invoked
 *                              during the next update cycle.
 *
 * @return {Node} this
 */
Node.prototype.requestUpdate = function requestUpdate (requester) {
    if (this._inUpdate || !this.isMounted())
        return this.requestUpdateOnNextTick(requester);
    if (this._updateQueue.indexOf(requester) === -1) {
        this._updateQueue.push(requester);
        if (!this._requestingUpdate) this._requestUpdate();
    }
    return this;
};

/**
 * Schedules an update on the next tick.
 *
 * This method is similar to {@link Node#requestUpdate}, but schedules an
 * update on the **next** frame. It schedules the node's `onUpdate` function
 * to be invoked on the frame after the next invocation on
 * the node's onUpdate function.
 *
 * The primary use-case for this method is to request an update while being in
 * an update phase (e.g. because an animation is still active). Most of the
 * time, {@link Node#requestUpdate} is sufficient, since it automatically
 * falls back to {@link Node#requestUpdateOnNextTick} when being invoked during
 * the update phase.
 *
 * @method requestUpdateOnNextTick
 *
 * @param  {Number} requester   Id of the component (as returned by
 *                              {@link Node#addComponent}) to be updated. The
 *                              component's `onUpdate` method will be invoked
 *                              during the next update cycle.
 *
 * @return {Node} this
 */
Node.prototype.requestUpdateOnNextTick = function requestUpdateOnNextTick (requester) {
    if (this._nextUpdateQueue.indexOf(requester) === -1)
        this._nextUpdateQueue.push(requester);
    return this;
};

/**
 * Checks if the node is mounted. Unmounted nodes are detached from the scene
 * graph.
 *
 * @method isMounted
 *
 * @return {Boolean}    Boolean indicating whether the node is mounted or not.
 */
Node.prototype.isMounted = function isMounted () {
    return this._mounted;
};

/**
 * Checks if the node is being rendered. A node is being rendererd when it is
 * mounted to a parent node **and** shown.
 *
 * @method isRendered
 *
 * @return {Boolean}    Boolean indicating whether the node is rendered or not.
 */
Node.prototype.isRendered = function isRendered () {
    return this._mounted && this._shown;
};

/**
 * Checks if the node is visible ("shown").
 *
 * @method isShown
 *
 * @return {Boolean}    Boolean indicating whether the node is visible
 *                      ("shown") or not.
 */
Node.prototype.isShown = function isShown () {
    return this._shown;
};

/**
 * Determines the node's relative opacity.
 * The opacity needs to be within [0, 1], where 0 indicates a completely
 * transparent, therefore invisible node, whereas an opacity of 1 means the
 * node is completely solid.
 *
 * @method getOpacity
 *
 * @return {Number}         Relative opacity of the node.
 */
Node.prototype.getOpacity = function getOpacity () {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        return this.getComponent(this._opacityID).getOpacity();
    else if (this.isMounted())
        return OpacitySystem.get(this.getLocation()).getOpacity();
    else throw new Error('This node does not have access to an opacity component');
};

/**
 * Determines the node's previously set mount point.
 *
 * @method getMountPoint
 *
 * @return {Float32Array}   An array representing the mount point.
 */
Node.prototype.getMountPoint = function getMountPoint () {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        return this.getComponent(this._transformID).getMountPoint();
    else if (this.isMounted())
        return TransformSystem.get(this.getLocation()).getMountPoint();
    else throw new Error('This node does not have access to a transform component');
};

/**
 * Determines the node's previously set align.
 *
 * @method getAlign
 *
 * @return {Float32Array}   An array representing the align.
 */
Node.prototype.getAlign = function getAlign () {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        return this.getComponent(this._transformID).getAlign();
    else if (this.isMounted())
        return TransformSystem.get(this.getLocation()).getAlign();
    else throw new Error('This node does not have access to a transform component');
};

/**
 * Determines the node's previously set origin.
 *
 * @method getOrigin
 *
 * @return {Float32Array}   An array representing the origin.
 */
Node.prototype.getOrigin = function getOrigin () {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        return this.getComponent(this._transformID).getOrigin();
    else if (this.isMounted())
        return TransformSystem.get(this.getLocation()).getOrigin();
    else throw new Error('This node does not have access to a transform component');
};

/**
 * Determines the node's previously set position.
 *
 * @method getPosition
 *
 * @return {Float32Array}   An array representing the position.
 */
Node.prototype.getPosition = function getPosition () {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        return this.getComponent(this._transformID).getPosition();
    else if (this.isMounted())
        return TransformSystem.get(this.getLocation()).getPosition();
    else throw new Error('This node does not have access to a transform component');
};

/**
 * Returns the node's current rotation
 *
 * @method getRotation
 *
 * @return {Float32Array} an array of four values, showing the rotation as a quaternion
 */
Node.prototype.getRotation = function getRotation () {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        return this.getComponent(this._transformID).getRotation();
    else if (this.isMounted())
        return TransformSystem.get(this.getLocation()).getRotation();
    else throw new Error('This node does not have access to a transform component');
};

/**
 * Returns the scale of the node
 *
 * @method
 *
 * @return {Float32Array} an array showing the current scale vector
 */
Node.prototype.getScale = function getScale () {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        return this.getComponent(this._transformID).getScale();
    else if (this.isMounted())
        return TransformSystem.get(this.getLocation()).getScale();
    else throw new Error('This node does not have access to a transform component');
};

/**
 * Returns the current size mode of the node
 *
 * @method
 *
 * @return {Float32Array} an array of numbers showing the current size mode
 */
Node.prototype.getSizeMode = function getSizeMode () {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        return this.getComponent(this._sizeID).getSizeMode();
    else if (this.isMounted())
        return SizeSystem.get(this.getLocation()).getSizeMode();
    else throw new Error('This node does not have access to a size component');
};

/**
 * Returns the current proportional size
 *
 * @method
 *
 * @return {Float32Array} a vector 3 showing the current proportional size
 */
Node.prototype.getProportionalSize = function getProportionalSize () {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        return this.getComponent(this._sizeID).getProportional();
    else if (this.isMounted())
        return SizeSystem.get(this.getLocation()).getProportional();
    else throw new Error('This node does not have access to a size component');
};

/**
 * Returns the differential size of the node
 *
 * @method
 *
 * @return {Float32Array} a vector 3 showing the current differential size
 */
Node.prototype.getDifferentialSize = function getDifferentialSize () {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        return this.getComponent(this._sizeID).getDifferential();
    else if (this.isMounted())
        return SizeSystem.get(this.getLocation()).getDifferential();
    else throw new Error('This node does not have access to a size component');
};

/**
 * Returns the absolute size of the node
 *
 * @method
 *
 * @return {Float32Array} a vector 3 showing the current absolute size of the node
 */
Node.prototype.getAbsoluteSize = function getAbsoluteSize () {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        return this.getComponent(this._sizeID).getAbsolute();
    else if (this.isMounted())
        return SizeSystem.get(this.getLocation()).getAbsolute();
    else throw new Error('This node does not have access to a size component');
};

/**
 * Returns the current Render Size of the node. Note that the render size
 * is asynchronous (will always be one frame behind) and needs to be explicitely
 * calculated by setting the proper size mode.
 *
 * @method
 *
 * @return {Float32Array} a vector 3 showing the current render size
 */
Node.prototype.getRenderSize = function getRenderSize () {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        return this.getComponent(this._sizeID).getRender();
    else if (this.isMounted())
        return SizeSystem.get(this.getLocation()).getRender();
    else throw new Error('This node does not have access to a size component');
};

/**
 * Returns the external size of the node
 *
 * @method
 *
 * @return {Float32Array} a vector 3 of the final calculated side of the node
 */
Node.prototype.getSize = function getSize () {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        return this.getComponent(this._sizeID).get();
    else if (this.isMounted())
        return SizeSystem.get(this.getLocation()).get();
    else throw new Error('This node does not have access to a size component');
};

/**
 * Returns the current world transform of the node
 *
 * @method
 *
 * @return {Float32Array} a 16 value transform
 */
Node.prototype.getTransform = function getTransform () {
    return TransformSystem.get(this.getLocation());
};

/**
 * Get the list of the UI Events that are currently associated with this node
 *
 * @method
 *
 * @return {Array} an array of strings representing the current subscribed UI event of this node
 */
Node.prototype.getUIEvents = function getUIEvents () {
    return this._UIEvents;
};

/**
 * Adds a new child to this node. If this method is called with no argument it will
 * create a new node, however it can also be called with an existing node which it will
 * append to the node that this method is being called on. Returns the new or passed in node.
 *
 * @method
 *
 * @param {Node | void} child the node to appended or no node to create a new node.
 *
 * @return {Node} the appended node.
 */
Node.prototype.addChild = function addChild (child) {
    var index = child ? this._children.indexOf(child) : -1;
    child = child ? child : new Node();

    if (index === -1) {
        index = this._freedChildIndicies.length ?
                this._freedChildIndicies.pop() : this._children.length;

        this._children[index] = child;
        this._fullChildren.push(child);
    }

    if (this.isMounted())
        child.mount(this.getLocation() + '/' + index);

    return child;
};

/**
 * Removes a child node from another node. The passed in node must be
 * a child of the node that this method is called upon.
 *
 * @method
 *
 * @param {Node} child node to be removed
 *
 * @return {Boolean} whether or not the node was successfully removed
 */
Node.prototype.removeChild = function removeChild (child) {
    var index = this._children.indexOf(child);

    if (index > - 1) {
        this._freedChildIndicies.push(index);

        this._children[index] = null;

        if (child.isMounted()) child.dismount();

        var fullChildrenIndex = this._fullChildren.indexOf(child);
        var len = this._fullChildren.length;
        var i = 0;

        for (i = fullChildrenIndex; i < len-1; i++)
            this._fullChildren[i] = this._fullChildren[i + 1];

        this._fullChildren.pop();

        return true;
    }
    else {
        return false;
    }
};

/**
 * Each component can only be added once per node.
 *
 * @method addComponent
 *
 * @param {Object} component    A component to be added.
 * @return {Number} index       The index at which the component has been
 *                              registered. Indices aren't necessarily
 *                              consecutive.
 */
Node.prototype.addComponent = function addComponent (component) {
    var index = this._components.indexOf(component);
    if (index === -1) {
        index = this._freedComponentIndicies.length ? this._freedComponentIndicies.pop() : this._components.length;
        this._components[index] = component;

        if (this.isMounted() && component.onMount)
            component.onMount(this, index);

        if (this.isShown() && component.onShow)
            component.onShow();
    }

    return index;
};

/**
 * @method  getComponent
 *
 * @param  {Number} index   Index at which the component has been registered
 *                          (using `Node#addComponent`).
 * @return {*}              The component registered at the passed in index (if
 *                          any).
 */
Node.prototype.getComponent = function getComponent (index) {
    return this._components[index];
};

/**
 * Removes a previously via {@link Node#addComponent} added component.
 *
 * @method removeComponent
 *
 * @param  {Object} component   An component that has previously been added
 *                              using {@link Node#addComponent}.
 *
 * @return {Node} this
 */
Node.prototype.removeComponent = function removeComponent (component) {
    var index = this._components.indexOf(component);
    if (index !== -1) {
        this._freedComponentIndicies.push(index);
        if (this.isShown() && component.onHide)
            component.onHide();

        if (this.isMounted() && component.onDismount)
            component.onDismount();

        this._components[index] = null;
    }
    return component;
};

/**
 * Removes a node's subscription to a particular UIEvent. All components
 * on the node will have the opportunity to remove all listeners depending
 * on this event.
 *
 * @method
 *
 * @param {String} eventName the name of the event
 *
 * @return {undefined} undefined
 */
Node.prototype.removeUIEvent = function removeUIEvent (eventName) {
    var UIEvents = this.getUIEvents();
    var components = this._components;
    var component;

    var index = UIEvents.indexOf(eventName);
    if (index !== -1) {
        UIEvents.splice(index, 1);
        for (var i = 0, len = components.length ; i < len ; i++) {
            component = components[i];
            if (component && component.onRemoveUIEvent) component.onRemoveUIEvent(eventName);
        }
    }
};

/**
 * Subscribes a node to a UI Event. All components on the node
 * will have the opportunity to begin listening to that event
 * and alerting the scene graph.
 *
 * @method
 *
 * @param {String} eventName the name of the event
 *
 * @return {Node} this
 */
Node.prototype.addUIEvent = function addUIEvent (eventName) {
    var UIEvents = this.getUIEvents();
    var components = this._components;
    var component;

    var added = UIEvents.indexOf(eventName) !== -1;
    if (!added) {
        UIEvents.push(eventName);
        for (var i = 0, len = components.length ; i < len ; i++) {
            component = components[i];
            if (component && component.onAddUIEvent) component.onAddUIEvent(eventName);
        }
    }

    return this;
};

/**
 * Private method for the Node to request an update for itself.
 *
 * @method
 * @private
 *
 * @param {Boolean} force whether or not to force the update
 *
 * @return {undefined} undefined
 */
Node.prototype._requestUpdate = function _requestUpdate (force) {
    if (force || !this._requestingUpdate) {
        if (this._updater)
            this._updater.requestUpdate(this);
        this._requestingUpdate = true;
    }
};

/**
 * Private method to set an optional value in an array, and
 * request an update if this changes the value of the array.
 *
 * @method
 *
 * @param {Array} vec the array to insert the value into
 * @param {Number} index the index at which to insert the value
 * @param {Any} val the value to potentially insert (if not null or undefined)
 *
 * @return {Boolean} whether or not a new value was inserted.
 */
Node.prototype._vecOptionalSet = function _vecOptionalSet (vec, index, val) {
    if (val != null && vec[index] !== val) {
        vec[index] = val;
        if (!this._requestingUpdate) this._requestUpdate();
        return true;
    }
    return false;
};

/**
 * Shows the node, which is to say, calls onShow on all of the
 * node's components. Renderable components can then issue the
 * draw commands necessary to be shown.
 *
 * @method
 *
 * @return {Node} this
 */
Node.prototype.show = function show () {
    Dispatch.show(this.getLocation());
    this._shown = true;
    return this;
};

/**
 * Hides the node, which is to say, calls onHide on all of the
 * node's components. Renderable components can then issue
 * the draw commands necessary to be hidden
 *
 * @method
 *
 * @return {Node} this
 */
Node.prototype.hide = function hide () {
    Dispatch.hide(this.getLocation());
    this._shown = false;
    return this;
};

/**
 * Sets the align value of the node. Will call onAlignChange
 * on all of the Node's components.
 *
 * @method
 *
 * @param {Number} x Align value in the x dimension.
 * @param {Number} y Align value in the y dimension.
 * @param {Number} z Align value in the z dimension.
 *
 * @return {Node} this
 */
Node.prototype.setAlign = function setAlign (x, y, z) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        this.getComponent(this._transformID).setAlign(x, y, z);
    else if (this.isMounted())
        TransformSystem.get(this.getLocation()).setAlign(x, y, z);
    else throw new Error('This node does not have access to a transform component');
    return this;
};

/**
 * Sets the mount point value of the node. Will call onMountPointChange
 * on all of the node's components.
 *
 * @method
 *
 * @param {Number} x MountPoint value in x dimension
 * @param {Number} y MountPoint value in y dimension
 * @param {Number} z MountPoint value in z dimension
 *
 * @return {Node} this
 */
Node.prototype.setMountPoint = function setMountPoint (x, y, z) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        this.getComponent(this._transformID).setMountPoint(x, y, z);
    else if (this.isMounted())
        TransformSystem.get(this.getLocation()).setMountPoint(x, y, z);
    else throw new Error('This node does not have access to a transform component');
    return this;
};

/**
 * Sets the origin value of the node. Will call onOriginChange
 * on all of the node's components.
 *
 * @method
 *
 * @param {Number} x Origin value in x dimension
 * @param {Number} y Origin value in y dimension
 * @param {Number} z Origin value in z dimension
 *
 * @return {Node} this
 */
Node.prototype.setOrigin = function setOrigin (x, y, z) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        this.getComponent(this._transformID).setOrigin(x, y, z);
    else if (this.isMounted())
        TransformSystem.get(this.getLocation()).setOrigin(x, y, z);
    else throw new Error('This node does not have access to a transform component');
    return this;
};

/**
 * Sets the position of the node. Will call onPositionChange
 * on all of the node's components.
 *
 * @method
 *
 * @param {Number} x Position in x
 * @param {Number} y Position in y
 * @param {Number} z Position in z
 *
 * @return {Node} this
 */
Node.prototype.setPosition = function setPosition (x, y, z) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        this.getComponent(this._transformID).setPosition(x, y, z);
    else if (this.isMounted())
        TransformSystem.get(this.getLocation()).setPosition(x, y, z);
    else throw new Error('This node does not have access to a transform component');
    return this;
};

/**
 * Sets the rotation of the node. Will call onRotationChange
 * on all of the node's components. This method takes either
 * Euler angles or a quaternion. If the fourth argument is undefined
 * Euler angles are assumed.
 *
 * @method
 *
 * @param {Number} x Either the rotation around the x axis or the magnitude in x of the axis of rotation.
 * @param {Number} y Either the rotation around the y axis or the magnitude in y of the axis of rotation.
 * @param {Number} z Either the rotation around the z axis or the magnitude in z of the axis of rotation.
 * @param {Number|undefined} w the amount of rotation around the axis of rotation, if a quaternion is specified.
 *
 * @return {Node} this
 */
Node.prototype.setRotation = function setRotation (x, y, z, w) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        this.getComponent(this._transformID).setRotation(x, y, z, w);
    else if (this.isMounted())
        TransformSystem.get(this.getLocation()).setRotation(x, y, z, w);
    else throw new Error('This node does not have access to a transform component');
    return this;
};

/**
 * Sets the scale of the node. The default value is 1 in all dimensions.
 * The node's components will have onScaleChanged called on them.
 *
 * @method
 *
 * @param {Number} x Scale value in x
 * @param {Number} y Scale value in y
 * @param {Number} z Scale value in z
 *
 * @return {Node} this
 */
Node.prototype.setScale = function setScale (x, y, z) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        this.getComponent(this._transformID).setScale(x, y, z);
    else if (this.isMounted())
        TransformSystem.get(this.getLocation()).setScale(x, y, z);
    else throw new Error('This node does not have access to a transform component');
    return this;
};

/**
 * Sets the value of the opacity of this node. All of the node's
 * components will have onOpacityChange called on them.
 *
 * @method
 *
 * @param {Number} val=1 Value of the opacity. 1 is the default.
 *
 * @return {Node} this
 */
Node.prototype.setOpacity = function setOpacity (val) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        this.getComponent(this._opacityID).setOpacity(val);
    else if (this.isMounted())
        OpacitySystem.get(this.getLocation()).setOpacity(val);
    else throw new Error('This node does not have access to an opacity component');
    return this;
};

/**
 * Sets the size mode being used for determining the node's final width, height
 * and depth.
 * Size modes are a way to define the way the node's size is being calculated.
 * Size modes are enums set on the {@link Size} constructor (and aliased on
 * the Node).
 *
 * @example
 * node.setSizeMode(Node.RELATIVE_SIZE, Node.ABSOLUTE_SIZE, Node.ABSOLUTE_SIZE);
 * // Instead of null, any proportional height or depth can be passed in, since
 * // it would be ignored in any case.
 * node.setProportionalSize(0.5, null, null);
 * node.setAbsoluteSize(null, 100, 200);
 *
 * @method setSizeMode
 *
 * @param {SizeMode} x    The size mode being used for determining the size in
 *                        x direction ("width").
 * @param {SizeMode} y    The size mode being used for determining the size in
 *                        y direction ("height").
 * @param {SizeMode} z    The size mode being used for determining the size in
 *                        z direction ("depth").
 *
 * @return {Node} this
 */
Node.prototype.setSizeMode = function setSizeMode (x, y, z) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        this.getComponent(this._sizeID).setSizeMode(x, y, z);
    else if (this.isMounted())
        SizeSystem.get(this.getLocation()).setSizeMode(x, y, z);
    else throw new Error('This node does not have access to a size component');
    return this;
};

/**
 * A proportional size defines the node's dimensions relative to its parents
 * final size.
 * Proportional sizes need to be within the range of [0, 1].
 *
 * @method setProportionalSize
 *
 * @param {Number} x    x-Size in pixels ("width").
 * @param {Number} y    y-Size in pixels ("height").
 * @param {Number} z    z-Size in pixels ("depth").
 *
 * @return {Node} this
 */
Node.prototype.setProportionalSize = function setProportionalSize (x, y, z) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        this.getComponent(this._sizeID).setProportional(x, y, z);
    else if (this.isMounted())
        SizeSystem.get(this.getLocation()).setProportional(x, y, z);
    else throw new Error('This node does not have access to a size component');
    return this;
};

/**
 * Differential sizing can be used to add or subtract an absolute size from an
 * otherwise proportionally sized node.
 * E.g. a differential width of `-10` and a proportional width of `0.5` is
 * being interpreted as setting the node's size to 50% of its parent's width
 * *minus* 10 pixels.
 *
 * @method setDifferentialSize
 *
 * @param {Number} x    x-Size to be added to the relatively sized node in
 *                      pixels ("width").
 * @param {Number} y    y-Size to be added to the relatively sized node in
 *                      pixels ("height").
 * @param {Number} z    z-Size to be added to the relatively sized node in
 *                      pixels ("depth").
 *
 * @return {Node} this
 */
Node.prototype.setDifferentialSize = function setDifferentialSize (x, y, z) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        this.getComponent(this._sizeID).setDifferential(x, y, z);
    else if (this.isMounted())
        SizeSystem.get(this.getLocation()).setDifferential(x, y, z);
    else throw new Error('This node does not have access to a size component');
    return this;
};

/**
 * Sets the node's size in pixels, independent of its parent.
 *
 * @method setAbsoluteSize
 *
 * @param {Number} x x-Size in pixels ("width").
 * @param {Number} y y-Size in pixels ("height").
 * @param {Number} z z-Size in pixels ("depth").
 *
 * @return {Node} this
 */
Node.prototype.setAbsoluteSize = function setAbsoluteSize (x, y, z) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        this.getComponent(this._sizeID).setAbsolute(x, y, z);
    else if (this.isMounted())
        SizeSystem.get(this.getLocation()).setAbsolute(x, y, z);
    else throw new Error('This node does not have access to a size component');
    return this;
};

/**
 * Method for getting the current frame. Will be deprecated.
 *
 * @method
 *
 * @return {Number} current frame
 */
Node.prototype.getFrame = function getFrame () {
    return this._updater.getFrame();
};

/**
 * returns an array of the components currently attached to this
 * node.
 *
 * @method getComponents
 *
 * @return {Array} list of components.
 */
Node.prototype.getComponents = function getComponents () {
    return this._components;
};

/**
 * Enters the node's update phase while updating its own spec and updating its components.
 *
 * @method update
 *
 * @param  {Number} time    high-resolution timestamp, usually retrieved using
 *                          requestAnimationFrame
 *
 * @return {Node} this
 */
Node.prototype.update = function update (time){
    this._inUpdate = true;
    var nextQueue = this._nextUpdateQueue;
    var queue = this._updateQueue;
    var item;

    while (nextQueue.length) queue.unshift(nextQueue.pop());

    while (queue.length) {
        item = this._components[queue.shift()];
        if (item && item.onUpdate) item.onUpdate(time);
    }

    this._inUpdate = false;
    this._requestingUpdate = false;

    if (!this.isMounted()) {
        // last update
        this._parent = null;
        this._id = null;
    }
    else if (this._nextUpdateQueue.length) {
        this._updater.requestUpdateOnNextTick(this);
        this._requestingUpdate = true;
    }
    return this;
};

/**
 * Mounts the node and therefore its subtree by setting it as a child of the
 * passed in parent.
 *
 * @method mount
 *
 * @param  {String} path unique path of node (e.g. `body/0/1`)
 *
 * @return {Node} this
 */
Node.prototype.mount = function mount (path) {
    if (this.isMounted())
        throw new Error('Node is already mounted at: ' + this.getLocation());

    if (!this.constructor.NO_DEFAULT_COMPONENTS){
        TransformSystem.registerTransformAtPath(path, this.getComponent(this._transformID));
        OpacitySystem.registerOpacityAtPath(path, this.getComponent(this._opacityID));
        SizeSystem.registerSizeAtPath(path, this.getComponent(this._sizeID));
    }
    else {
        TransformSystem.registerTransformAtPath(path);
        OpacitySystem.registerOpacityAtPath(path);
        SizeSystem.registerSizeAtPath(path);
    }
    Dispatch.mount(path, this);

    if (!this._requestingUpdate) this._requestUpdate();
    return this;

};

/**
 * Dismounts (detaches) the node from the scene graph by removing it as a
 * child of its parent.
 *
 * @method
 *
 * @return {Node} this
 */
Node.prototype.dismount = function dismount () {
    if (!this.isMounted())
        throw new Error('Node is not mounted');

    var path = this.getLocation();

    TransformSystem.deregisterTransformAtPath(path);
    SizeSystem.deregisterSizeAtPath(path);
    OpacitySystem.deregisterOpacityAtPath(path);
    Dispatch.dismount(path);

    if (!this._requestingUpdate) this._requestUpdate();
};

module.exports = Node;
