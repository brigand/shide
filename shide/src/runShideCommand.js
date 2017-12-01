const ShideRuntime = require('./runtime');

async function runShideCommand(cmdDesc, inputArgs = []) {
  const { main } = cmdDesc;

  let commandModule = null;
  try {
    commandModule = require(main);
  } catch (e) {
    console.error(`SHIDE ERR FATAL Attempted to load "${main}" but it errored. See the console for the full error.`);
    console.error(e);
    process.exit(19);
  }

  let runtime = null;
  try {
    runtime = new ShideRuntime({
      inputArgs,
    });
    runtime.init();
  } catch (e) {
    console.error(`SHIDE ERR FATAL Failed to init js runtime. This is likely a bug in shide.`);
    process.exit(19);
  }

  if (!commandModule.run) {
    console.error(`SHIDE ERR FATAL Command at "${main}" must export a 'run' method, e.g. exports.run = async function(shide){ }`);
    process.exit(19);
  }

  try {
    await commandModule.run(runtime);
  } catch (e) {
    console.error(`SHIDE ERR FATAL Command at "${main}" failed.`);
    console.error(e);
    process.exit(19);
  }

  // Complete
}

module.exports = runShideCommand;
