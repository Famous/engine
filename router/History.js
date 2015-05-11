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

var sessionHistorySupport = window.history && window.history.pushState && window.history.replaceState;

/**
 * A stateless shim for hash routing. Used by router.
 *   Supports hash bang routing and HTML5 pushState.
 *   Falls back to hash bang urls when pushState is not supported.
 *   Implements subset of W3C spec in respect to
 *   http://www.w3.org/TR/2011/WD-html5-20110113/history.html#history-0
 *
 * @History
 * @class
 * @constructor
 * @private
 *
 * @example
 * var history = History();
 * console.log(history.hashBangUrls);
 * history.pushState({}, document.title, '/route');
 *
 * @param {Object} options
 * @param {Boolean} options.hashBangUrls force history to use URLs
 *   in the form of /#!/route
 * @param {String} root
 */
function History(options) {
    if (!(this instanceof History)) return new History(options);

    options = options || {};
    this._root = options.root || '';
    this._sessionHistorySupport = sessionHistorySupport;
    this.hashBangUrls = options.hashBangUrls || !this._sessionHistorySupport;
    this._location = window.location;
}

/**
 * @property {Boolean} hashBangUrls
 * @readonly
 */
History.prototype.hashBangUrls = false;

/**
 * Register a function to be invoked on every state change.
 *
 * @method onStateChange
 * @chainable
 *
 * @param {Function} handler callback to invoke on state change
 *
 * @return {History} this
 */
History.prototype.onStateChange = function onStateChange(handler) {
    // prefer HTML5 history API over hashchange when possible
    if (this._sessionHistorySupport) {
        window.addEventListener('popstate', handler);
        window.addEventListener('pushstate', handler);
    }
    else if (this.hashBangUrls && 'onhashchange' in window) {
        window.addEventListener('hashchange', handler);
    }
    else {
        // only possible solution at this point is to use an ugly combination
        // of setInterval and window.location.pathname
    }
    return this;
};

/**
 * Deregister a state change handler that has been previously registered
 *   through onStateChange.
 *
 * @method offStateChange
 * @chainable
 *
 * @param {Function} handler handler previously registered through onStateChange
 *
 * @return {History} this
 */
History.prototype.offStateChange = function offStateChange(handler) {
    window.removeEventListener('popstate', handler);
    window.removeEventListener('pushstate', handler);
    window.removeEventListener('hashchange', handler);
    return this;
};

/**
 * Shim for window.history.pushState
 * 
 * @method pushState
 * @chainable
 *
 * @params {Object} data state object passed through session API if possible,
 *   not accessable later on, used to make arguments list complaint with W3C
 *   spec
 * @params {String=document.title} title new document title, not associated with
 *   new state
 * @params {String} url
 *
 * @return {History} this
 */
History.prototype.pushState = function pushState(data, title, url) {
    document.title = title || document.title;
    if (this.hashBangUrls) {
        if (this._sessionHistorySupport) {
            window.history.pushState(data, title, '#!' + url);
        }
        else {
            window.location.hash = url;
        }
    }
    else {
        window.history.pushState(data, title, url);
    }
    return this;
};

/**
 * Shim for window.history.replaceState
 * 
 * @method replaceState
 * @chainable
 *
 * @params {Object} data state object passed through session API if possible,
 *   not accessable later on, used to make arguments list complaint with W3C
 *   spec
 * @params {String=document.title} title new document title, not associated with
 *   new state
 * @params {String} url
 *
 * @return {History} this
 */
History.prototype.replaceState = function replaceState(data, title, url) {
    document.title = title || document.title;
    if (this.hashBangUrls) {
        if (this._sessionHistorySupport) {
            window.history.replaceState(data, title, '#!' + url);
        }
        else {
            url = ('' + window.location).split('#')[0] + '#!' + url;
            window.location.replace(url);
        }
    }
    else {
        window.history.replaceState(data, title, url);
    }
    return this;
};

/**
 * Return current normalized state (routed pathname).
 * Not compliant with [W3C spec 5.4 Session history and
 * navigation](http://www.w3.org/TR/2011/WD-html5-20110113/history.html)
 *
 * @method getState
 *
 * @return {String|null} state as normalized pathname
 */
History.prototype.getState = function getState() {
    if (!this._location.pathname.match('^' + this._root)) {
        return null;
    }
    if (this.hashBangUrls) {
        return this._location.hash.substring(2);
    }
    else {
        return decodeURI(this._location.pathname).substring(this._root.length);
    }
};

module.exports = History;
