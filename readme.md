ThunderUI is the development and test UI that runs on top of the Thunder. Thunder UI provides remote control over a Thunder enabled device for testing and debugging purposes.

# Prerequisites

You need NodeJS + NPM (https://nodejs.org/en/) and Grunt installed (https://gruntjs.com/getting-started) in order to run the grunt task. If you do not know how to install nodejs and grunt, you probably shouldn't be making changes here.

# Setup

To get started run:
```
npm install
```

# Compile

To compile a release version of WPE Framework UI please run
```
grunt release
```

# Local

To run a local copy of WPEFrameworkUI (for dev purposes) please run, please build the debug by running
```
grunt
```

Or run `grunt watch` and on any change in JS the grunt compile task to generate the debug.html will be run automatically.
