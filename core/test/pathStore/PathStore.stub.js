'use strict';

var sinon = require('sinon');
var api = require('./PathStore.api');

function PathStore () {
    api.forEach(function (method) {
        this[method] = sinon.stub();
    }.bind(this));
}

module.exports = PathStore;

