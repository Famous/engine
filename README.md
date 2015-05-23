Famous Engine
=================

[![Build Status](https://travis-ci.org/Famous/engine.svg?branch=master)](https://travis-ci.org/Famous/engine) [![Dependency Status](https://david-dm.org/Famous/engine.svg)](https://david-dm.org/Famous/engine) [![devDependency Status](https://david-dm.org/Famous/engine/dev-status.svg)](https://david-dm.org/Famous/engine#info=devDependencies)

The Famous Engine is a free and open source JavaScript rendering engine. What makes the Famous Engine unique is its JavaScript rendering engine and 3D physics engine that gives developers the power and tools to build native quality apps and animations using pure JavaScript. It is designed to allow developers the ability to render to both DOM and WebGL in a unified API.

## Getting Started    

We have several [guides & tutorials on our site](http://famous.org/learn/) to help you get up and running with Famous, such as [Hello Famous](http://famous.org/learn/hello-famous.html).
Here's a quick boilerplate example.

### Boilerplate

If you have the Famous Engine included in your project, it is very easy to start getting content rendered to the screen.  Below is a short example of how to get HTML content written to the screen.

```js
var FamousEngine = require('famous/core/FamousEngine');
var DOMElement = require('famous/dom-renderables/DOMElement');

FamousEngine.init();
var scene = FamousEngine.createScene();

var node = scene.addChild();
var domEl = new DOMElement(node, {
    content: 'Hello World',
    properties: {
        fontFamily: 'Arial'
    }
});
```

In this example, we use the Famous Engine to kick off the rendering process and create a scene for our application.  From here, we can add nodes to our scene and use components to give them the ability to draw.
For more, here are some deeper dives on [scene graph](http://famous.org/learn/scene-graph.html) and [components](http://famous.org/learn/components.html).

### Installation

The easiest way to install and get started with Famous is with the Famous CLI (Command Line Interface), which will bootstrap you with a small project containing the Famous Engine.  Check out the [guide on our site](http://famous.org/get-started.html) or the README in the [famous-cli repository][cli-repo] on Github to learn how to install and create an account with the CLI.

To get a new project, run the following commands:

```sh
famous create
famous create <seed-project-name>
```

From here, you can run your project to see a Famous application in action.

```sh
famous develop
```

### Seed Project

If you are looking for an easy way to get a Famous application up and running, check out our [seed project][famous-engine-seed].  This includes the FamousEngine, index.html file, preloaded CSS with friendly default values, and some boilerplate to get you started.

### npm

The Famous Engine is also available on npm.

```
npm install famous
```

This will add the Famous Engine to your node_modules folder to be included into your project.

## Contributing

Cloning this repository directly is primarily for those wishing to contribute to our codebase. Check out our [contributing instructions][contributing] to get involved.

Note: cloning only provides the Famo.us folder with all Famo.us code, but it does no application scaffolding. You will additionally need to create your own index.html.  Currently we have a dependency on glslify, a browserify transform to compile our glsl shaders.

## Documentation

- Rendered versions of the source code reference documentation: [docs][site-docs].
- Guides and tutorials: [guides][site-guides]

## Community

- If you would like to report a bug, please check the [issues][contributing-issues] section in our [contributing instructions][contributing].
- Please join us on the "famous-community" slack.
    - http://slack.famous.org/signup to sign up
    - http://slack.famous.org/ to log in
- For contributors, read more instructions in [CONTRIBUTING.md][contributing-issues].

## Licensing information
- The Famous rendering engine is licensed under the MIT license
- Contact licensing@famo.us for further inquiries.

[famous-site]: http://famous.org
[famous-docs]: http://famous.org/docs
[site-install]: http://famous.org/get-started.html
[site-guides]: http://famous.org/learn
[site-docs]: http://famous.org/
[cli-repo]: http://github.com/Famous/famous-cli
[famous-organization-github]: http://github.com/Famous
[famous-engine-seed]: http://github.com/Famous/engine-seed
[contributing]: https://github.com/Famous/engine/blob/master/CONTRIBUTING.md
[contributing-issues]: https://github.com/Famous/engine/blob/master/CONTRIBUTING.md#issues
[browserify]: http://browserify.org/
[npm]: http://npmjs.org

[![Analytics](https://ga-beacon.appspot.com/UA-63145313-2/famous/engine/README.md?pixel)](https://github.com/igrigorik/ga-beacon)
