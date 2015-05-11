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

var _History = require('./History');

/**
 * A simple router supporting HTML5 pushState and hashbang  routing ("#!/").
 * 
 * @example
 * var router = Router({
 *     '/example-route-0': function() {
 *         console.log('/example-route-0');
 *     },
 *     '/example-route-1': function() {
 *         console.log('/example-route-1');
 *     },
 *     '/example-route-2': function() {
 *         console.log('/example-route-2');
 *     },
 *     '/example-route-3': function() {
 *         console.log('/example-route-3');
 *     }
 * });
 *
 * var currentState = 0;
 * var interval = setInterval(function() {
 *     if (currentState === 4) return clearTimeout(interval);
 *     router.navigate('/example-route-' + currentState, { invoke: true });
 *     currentState++;
 * }, 1000);
 * 
 * @class Router
 * @constructor
 *
 * @param {Object} routes
 * @param {Object} options
 * @param {Boolean} options.silent
 * @param {Boolean} options.hashBangUrls
 * @param {Object} options.proxy
 * @param {String} options.root
 * @param {Boolean} options.validate check for unknown routes
 */
function Router(routes, options) {
    if (!(this instanceof Router)) return new Router(routes, options);
    
    routes = routes || {};
    options = options || {};

    this._root = options.root || '';

    this._routes = [];
    this.proxy = options.proxy || {};
    if (options.validate) this.validate = true;

    // Avoids cylic routing by storing the last routed state
    // Seems like W3C spec doesn't mention if pushState event should be
    // dispatched on page load.
    this._lastState = null;

    _addInitialRoutes.call(this, routes);

    this._history = _History({
        hashBangUrls: options.hashBangUrls,
        root: this._root
    }).onStateChange(_onStateChange.bind(this));

    if (!options.silent) this.start();
}

/**
 * Starts the router by invoking the route handler bound to the current
 *   pathname. Will be called by constructor, unless silent option is
 *   in use.
 *
 * @method start
 * @chainable
 *
 * @return {Router} this
 */
Router.prototype.start = function start() {
    this.invoke();
    return this;
};

/**
 * Navigates to the given route. If no route is give, navigate to the current
 *   pathname (used during initialization).
 *
 * @method navigate
 * @chainable
 *
 * @param {String} [state=current pathname]
 * @param {Object} options
 * @param {Boolean} options.replace
 * @param {Boolean} options.invoke
 *
 * @return {Router} this
 */
Router.prototype.navigate = function navigate(state, options) {
    options = options || {};
    state = state || this._history.getState();
    if (this._lastState === state) return this;

    var method = options.replace ? 'replaceState' : 'pushState';
    this._history[method](null, null, state);

    if (options.invoke) this.invoke();
    return this;
};

/**
 * Dynamically adds a route to the register.
 *
 * @method addRoute
 * @chainable
 *
 * @param {String|RegExp} route
 * @param {Function} handler
 *
 * @return {Router} this
 */
Router.prototype.addRoute = function addRoute(route, handler) {
    if (typeof route === 'string') route = _createRegExpRoute(route);
    this._routes.push({ regExp: route, handler: handler });
    return this;
};

/**
 * Invokes the handler bound to the given state.
 *
 * @method invoke
 * @chainable
 *
 * @param {String} [state=current pathname] route
 *
 * @return {Router} this
 */
Router.prototype.invoke = function invoke(state) {
    if (this._lastState === state) return this;
    state = state || this._history.getState();
    if (state === null) return;
    var unknown = this._routes.every(function (route) {
        var result = _checkRoute.call(this, route, state);
        if (result) {
            if (typeof route.handler === 'string' && this.proxy[route.handler]) {
                this.proxy[route.handler].apply(null, result);
            }
            else {
                route.handler.apply(null, result);
            }
        }
        return !result;
    }.bind(this));
    if (unknown && this.validate) throw new Error('Unknown route');
    return this;
};

function _checkRoute(route, state) {
    var result = state.match(route.regExp);
    if (!result) return false;

    // no support for nested capturing groups
    result = result.slice(1);
    return result;
}

function _createRegExpRoute(route) {
    // TODO could be extended to splats etc.
    route = route.replace(/\:\w+/, function (param) {
        param = param.substring(1);
        return '(' + param + ')';
    });
    return new RegExp('^' + route + '$');
}

function _onStateChange() {
    /* jshint validthis: true */
    this.invoke();
}

function _addInitialRoutes(routes, scope) {
    /* jshint validthis: true */
    scope = scope || '';
    if (Array.isArray(routes)) {
        // composing nested sets of regular expressions of regular expressions
        // including lookarounds might lead to unexpected behavior. For now,
        // those can't be traversed.
        routes.forEach(function(routeSpec) {
            this.addRoute(routeSpec.route, routeSpec.handler);
        }.bind(this));
    } else {
        for (var route in routes) {
            var handler = routes[route];
            if (handler instanceof Function || typeof handler === 'string') {
                this.addRoute(scope + route, routes[route]);
            }
            else {
                _addInitialRoutes.call(this, routes[route], scope + route);
            }
        }
    }
}

module.exports = Router;
