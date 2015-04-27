var ContextWebGL = require('./contextWebGL');

function CanvasElement() {
	this.context2D;
	this.contextWebGL;
}

CanvasElement.prototype.getContext = function getContext(type) {
	else if (type === 'webgl') return (this.contextWebGL = new ContextWebGL());
}

module.exports = CanvasElement;