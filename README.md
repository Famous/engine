Famous Engine
=================

[![Build Status](https://travis-ci.org/Famous/engine.svg?branch=master)](https://travis-ci.org/Famous/engine) [![Dependency Status](https://david-dm.org/Famous/engine.svg)](https://david-dm.org/Famous/engine) [![devDependency Status](https://david-dm.org/Famous/engine/dev-status.svg)](https://david-dm.org/Famous/engine#info=devDependencies)

The Famous Engine is a free and open source JavaScript rendering engine. What makes the Famous Engine unique is its JavaScript rendering engine and 3D physics engine that gives developers the power and tools to build native quality apps and animations using pure JavaScript. It is designed to allow developers the ability to render to both DOM and WebGL in a unified API.

## Getting Started

### NPM

The Famous Engine is available on NPM

```
npm install famous
```

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

### Seed Project

If you are looking for an easy way to get a Famous application up and running, check out our [seed project][famous-engine-seed].  This includes the FamousEngine, index.html file, preloaded CSS with friendly default values, and some boilerplate to get you started.

## Contributing

Cloning this repository directly is primarily for those wishing to contribute to our codebase. Check out our [contributing instructions][contributing] to get involved. 
    
Note: cloning only provides the Famo.us folder with all Famo.us code, but it does no application scaffolding. You will additionally need to create your own index.html.  Currently we have a dependency on glslify, a browserify transform to compile our glsl shaders.
  
## Documentation

- Rendered versions of the source code reference documentation: [docs][site-docs].
- Guides and tutorials: [guides][site-guides]

## Community

- If you would like to report a bug, please check the [issues][contributing-issues] section in our [contributing instructions][contributing].
- Please join us on the "famous-community" slack.
    - http://slack.famous.org/
    - Join the discussion https://famous-community.slack.com
- For contributors, read more instructions in [CONTRIBUTING.md][contributing-issues].

## Licensing information
- The Famous rendering engine is licensed under the MIT license
- Contact license@famo.us for further inquiries.

[famous-site]: http://famous.org
[famous-help]: https://famous.org/help
[famous-docs]: http://famous.org/docs
[site-install]: http://famous.org/install
[site-guides]: http://famous.org/guides
[site-docs]: http://famous.org/docs
[famous-organization-github]: http://github.com/Famous
[famous-engine-seed]: http://github.com/Famous/engine-seed
[contributing]: https://github.com/Famous/engine/blob/master/CONTRIBUTING.md
[contributing-issues]: https://github.com/Famous/engine/blob/master/CONTRIBUTING.md#issues
[browserify]: http://browserify.org/
[npm]: http://npmjs.org
