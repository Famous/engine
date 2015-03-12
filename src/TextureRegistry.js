var TextureRegistry = {
	registry: {},

	textureIds: 1,

	register: function register(accessor, data) {
		this.registry[accessor] = { id: this.textureIds++, data: data }
	},

	get: function get(accessor) {
		if (!this.registry[accessor]) {
			throw 'Texture "' + accessor + '" not found!';
		}
		else {
			return this.registry[accessor];
		}
	}
}

module.exports = TextureRegistry;