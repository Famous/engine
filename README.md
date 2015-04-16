renderers
=================

The renderers repository is a module designed to work with the Famous platform.  Renderers provides a medium independent interface for accepting draw commands. The role of renderers is to take the generic scene information and then pass on the medium specific (DOM, WebGL, etc) instructions to their particular renderers.  Compositor serves as the master renderer and has the responsibility for providing extra features such as DOM and WebGL layering.

## Tests

Make sure that npm and a javascript platform (Node.js or io.js) are installed on your machine.

Install the development dependencies

```sh
npm install
```

Run the tests

```sh
npm run test
```

#### Visual Tests

Visual tests can be found [here](http://github.com/Famous/visual-tests).  We use visual testing for debugging browser inconsistencies but they also serve as a great place to check out how to use the platform.

## Contributing

Cloning this repository directly is primarily for those wishing to contribute to our codebase. Check out our [contributing instructions](https://github.com/Famous/famous/blob/master/CONTRIBUTING.md) to get involved. 
    
Note: cloning only provides the library of components and not the entire platform nor any application scaffolding.
  
## Documentation

API documentation is available on our website in the [docs](https://famo.us/docs) section.  It is also available inside the [famous platform](https://github.com/famous/famous) repository.  API documentation is generated directly from the source code so feel free to dig into it here also.

Specific examples can be found [here](https://github.com/famous/examples).

Lessons on the Famous platform are available [here](https://famo.us/university).

## Dependencies

- [famous-components](https://github.com/Famous/components)
- [famous-dom-renderers](https://github.com/Famous/dom-renderers)
- [famous-webgl-renderers](https://github.com/Famous/webgl-renderers)
- [famous-utilities](https://github.com/Famous/utilities)

## License

All rights reserved. Famous Industries 2015
