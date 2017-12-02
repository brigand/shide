shide allows you to write simple scripts that interact with your editor, and share those scripts with your teammates.

## Status: pre-alpha

There's so much work to do. Currently it only supports the atom editor and writing scripts in JavaScript.

The feature set is fairly limited but it supports a few key APIs.

## Install

Currently only the atom package is available, and you won't be able to use shide if you use a different editor.

To install atom-shide, run this anywhere:

```sh
apm install atom-shide
```

You'll also need to install shide in projects that use it.

```sh
npm install --save-dev shide
```

shide requires node.js version 8.4.0 or later. You can install it globally, or use [nvm](http://nvm.sh) if you're on linux or osx. It'll automatically look for a version installed with nvm.

If you didn't have one already, a package.json will have been created by the `npm install` command. Add a property to package.json indicating where your shide scripts will be stored.

```js
"dependencies": { "shide": "1.0.0" },
"shide": "scripts/shide"
```

Create that directory so we can start writing shide scripts.

```sh
mkdir -p scripts/shide
```

Restart atom now ("Window: Reload" in the command pallet).

## Usage

Let's create our first shide script. It requires a config file, and a .js file.

```sh
echo '{}' > scripts/shide/hello-world.json
touch scripts/shide/hello-world.js
```

## TODO: more docs


