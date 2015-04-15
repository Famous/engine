engines
=================

Engines is a collection of engines that can be used to run your Famous application.  A Famous application can be run once, once a second, 60 times a second, once every time a certain message comes through, etc.  We currently provide three types of engines each with their own usecase.

- Engine.js: An engine designed to work with the browser's requestAnimationFrame such that the application will be updated at max 60 times a second.  This is the default engine of Famous
- ContainerEngine.js: An engine designed to work with the Famous container system.  It allows the ability to have applications easily be controlled by a master application.
- DebuggingEngine.js: An engine designed to be called directly from the console.  This allows the developer to debug applications one frame at a time.

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

- [famous-polyfills](https://github.com/Famous/polyfills)

## License

All rights reserved. Famous Industries 2015
