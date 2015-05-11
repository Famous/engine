'use strict';

/**
 * Load a URL and return its contents in a callback
 *
 * @method loadURL
 * @memberof Utilities
 * @param {string} url URL of object
 * @param {function} callback callback to dispatch with content
 */
var loadURL = function loadURL(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function onreadystatechange() {
        if (this.readyState === 4) {
            if (callback) callback(this.responseText);
        }
    };
    xhr.open('GET', url);
    xhr.send();
};

module.exports = loadURL;
