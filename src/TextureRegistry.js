var TextureRegistry = {
	registry: {},

	textureIds: 1,

	register: function register(accessor, data) {
		if (accessor) return (this.registry[accessor] = { id: this.textureIds++, data: data });
		else return { id: this.textureIds++, data: data, __isATexture__: true };
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
