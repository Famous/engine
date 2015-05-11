'use strict';

/**
 * Transform identity matrix.
 */ 
var ident = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
];

/**
 * ElementCache is being used for keeping track of an element's DOM Element,
 * path, world transform, inverted parent, final transform (as being used for
 * setting the actual `transform`-property) and post render size (final size as
 * being rendered to the DOM).
 * 
 * @class   ElementCache
 *  
 * @param  {Element} element    DOMElement
 * @param  {String} path        Path used for uniquely identifying the location
 *                              in the scene graph.
 */ 
function ElementCache (element, path) {
    this.element = element;
    this.path = path;
    this.worldTransform = new Float32Array(ident);
    this.invertedParent = new Float32Array(ident);
    this.finalTransform = new Float32Array(ident);
    this.postRenderSize = new Float32Array(2);
}

module.exports = ElementCache;
