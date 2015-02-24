'use strict';

var ObjectObserver = require('./ObjectObserver');
var ArrayObserver = require('./ArrayObserver');
var RenderHandler = require('famous-handlers').RenderHandler;

function ModelView (dispatch) {
    this._model = null;
    this._renderer = null;
    this._modelControllers = [];
    this._rendererControllers = [];
    this._dispatch = dispatch;
}

ModelView.prototype.kill = function kill () {
    if (this._childManager) this._childManager.stopObserving();
    if (this._subscriptionManager) this._subscriptionManager.stopObserving();
    return this;
};

ModelView.prototype.acceptModel = function acceptModel (model) {
    this._model = model;
    var renderer = new model.constructor.renderWith(this._dispatch, this._model);
    this._rendererControllers.push(new RenderHandler(renderer, this._dispatch));
    this._renderer = renderer;
    var Handler;
    if (model.constructor.handlers) {
        for (var i = 0, len = model.constructor.handlers.length ; i < len ; i++) {
            Handler = model.constructor.handlers[i];
            this._modelControllers.push(new Handler(model, this._dispatch));
        }
    }
    if (renderer.constructor.handlers) {
        for (i = 0, len = renderer.constructor.handlers.length ; i < len ; i++) {
            Handler = renderer.constructor.handlers[i];
            this._rendererControllers.push(new Handler(renderer, this._dispatch));
        }
    }
    var subscriptions = this._renderer.constructor.subscribe;
    _findPublication.call(this, model);
    if (subscriptions) {
        this._subscriptionManager = new ObjectObserver(model);
        _manageSubscriptions.call(this, this._subscriptionManager, subscriptions);
    }
    if (this._renderer.draw) this._renderer.draw();
    return this;
};

ModelView.prototype.publishAdd = function publishAdd (change) {
    var addedCount = change.addedCount;
    var index = change.index;
    var node = this._dispatch.getNode();
    for (var i = 0, len = addedCount ; i < len ; i++) {
        node
            .addChild(index + i)
            .getDispatch()
            .acceptModel(change.object[index + i]);
        if (this._renderer.layout)
            node.layout(index + i, this._renderer.layout, this._renderer);
    }
};

ModelView.prototype.update = function update () {
    if (this._subscriptionManager) this._subscriptionManager.callbacks.trigger('*');
};

ModelView.prototype.publishRemove = function publishRemove (change) {
    var removed = change.removed;
    var index = change.index;
    var node = this._dispatch.getNode();
    for (var i = 0, len = removed.length ; i < len ; i++) {
        node.removeChildAtIndex(index + i);
    }
    if (this._renderer.layout)
        node.reflowWith(this._renderer.layout, this._renderer);
};

ModelView.prototype.publishSwap = function publishSwap (change) {
    var index = change.index;
    var node = this._dispatch.getNode();
    node.removeChildAtIndex(index);
    node.addChild(index).getDispatch().acceptModel(change.object[index]);
    if (this._renderer.layout)
        node.reflowWith(this._renderer.layout, this._renderer);
};

ModelView.prototype.swapChild = function swapChild (change) {
    var name = change.name;
    var obj = change.object;
    var instance = obj[name];
    var node = this._dispatch.getNode();
    node.removeAllChildren();
    node.addChild(0).getDispatch().acceptModel(instance);
    if (this._renderer.layout)
        node.layout(0, this._renderer.layout, this.renderer);
};

ModelView.prototype.swapChildAtIndex = function swapChildAtIndex (change) {
    // todo
};

function _findPublication (model) {
    /*jshint validthis: true */
    var publicationKey = model.constructor.publish;
    if (!publicationKey) return;
    else if (publicationKey.constructor === String) {
        if (model[publicationKey].constructor === Array) {
            this._childManager = new ArrayObserver(model[publicationKey]);
            this._childManager.subscribe('added', this.publishAdd.bind(this));
            this._childManager.subscribe('removed', this.publishRemove.bind(this));
            this._childManager.subscribe('update', this.publishSwap.bind(this));
            var i = 0;
            var len = model[publicationKey].length;
            var node = this._dispatch.getNode();
            for (; i < len ; i++) {
                node.addChild().getDispatch().acceptModel(model[publicationKey][i]);
                if (this._renderer.layout)
                    node.layout(i, this._renderer.layout, this._renderer);
            }
        } else {
            this._childManager = new ObjectObserver(model);
            this._childManager.subscribe(publicationKey, this.swapChild.bind(this));
            var node = this._dispatch.getNode();
            node.removeAllChildren();
            node.addChild(0).getDispatch().acceptModel(model[publicationKey]);
            if (this._renderer.layout) node.reflowWith(this._renderer.layout, this._renderer);
        }
    } else if (publicationKey.constructor === Array) {
        this._childManager = new ObjectObserver(model);
        var i = 0;
        var len = publicationKey.length;
        var node = this._dispatch.getNode();
        node.removeAllChildren();
        for (; i < len ; i++) {
            this._childManager.subscribe(publicationKey[i], this.swapChildAtIndex.bind(this, i));
            if (model[publicationKey[i]]) node.addChild(i).getDispatch().acceptModel(model[publicationKey[i]]);
        }
        if (this._renderer.layout) node.reflowWith(this._renderer.layout, this._renderer);
    }
    this._childManager.startObserving();
}

function _manageSubscriptions(manager, subscriptions) {
    var key;
    var i;
    var len;
    var subscriptionKey;
    for (key in subscriptions) {
        i = 0;
        len = subscriptions[key].length;
        for (; i < len ; i++) {
            subscriptionKey = subscriptions[key][i];
            manager.subscribe(subscriptionKey, unwrapUpdate.bind(this, key));
        }
    }
    manager.startObserving();
}

function unwrapUpdate (key, update) {
    /*jshint validthis: true */
    var value;
    var controllers = this._rendererControllers;
    if (update) value = update.object;
    var captured = false;
    for (var i = 0, len = controllers.length ; i < len ; i++) {
        captured = controllers[i].trigger(key, value);
    }
    if (!captured) this._renderer[key](value);
}

module.exports = ModelView;
