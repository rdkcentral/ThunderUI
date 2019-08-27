# Thunder UI

ThunderUI is the development and test UI that runs on top of Thunder. Thunder UI provides remote control over a Thunder enabled device for testing and debugging purposes.

## Prerequisites

You need NodeJS + NPM ([https://nodejs.org](https://nodejs.org)) installed. If you do not know how to install NodeJS, you probably shouldn't be making changes here.

## Setup

To get started run:

```
npm install
```

## Build

To build a release version of Thunder UI please run:

```
npm run build
```

## Local

To run a local copy of Thunder UI (for dev purposes), first update the host in `.env.local` to point to the IP address of your local device.


Next run:
```
npm start
```

This will build a local version of Thunder UI (with sourcemaps) and open up a browser window pointing to this local version.

On top of that a watcher is initiated that will _rebuild_ Thunder UI every time a change is made in the `src` folder (note: manual browser refresh still required).
