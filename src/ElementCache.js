'use strict';

function ElementCache (element) {
    this.element = element;
    this.worldTransform = new Float32Array(16);
    this.invertedParent = new Float32Array(16);
    this.finalTransform = new Float32Array(16);
    this.postRenderSize = new Float32Array(2);
};

module.exports = ElementCache;

