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

## Usage

Let's create our first shide script. It requires a config file, and a .js file.

```sh
echo '{}' > scripts/shide/hello-world.json
touch scripts/shide/hello-world.js
```

Restart atom now ("Window: Reload" in the command pallet).

In hello-world.js we'll create a simple script. It gets the path of the currently
open file in the editor, reads the content of that file, and then writes it back.

```js
exports.run = (ide) => {
  const { path: activePath } = await ide.getActiveFile();
  const { text } = await ide.getFileContent({ path: activePath });
  const output = text.toLowerCase();
  await ide.setFileContent({
    path: activePath,
    text: output,
  });
}
```

This is pretty similar to what you'd do in a normal script, getting the file
path from the CLI, reading the text from the file system, and then writing the file.

The difference is that this is integrated into your editor. It can see your open
files, it can read the content even if you haven't saved them to disk, and you
can update the file with or without saving it. You get an undo history item
for the change.

Having access to the editor state is the main advantage of shide over CLI scripts.
