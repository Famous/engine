var CanvasElement = require('./Canvas');

var document = {
	createElement: function(type) {
		if (type === 'canvas') return new CanvasElement();
	}
}

module.exports = document;