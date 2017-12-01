'use babel';

const getCommands = require('./getCommands');
const runShideCommand = require('./runShideCommand');
const args = process.argv.slice(2);
const argCommand = args.shift();

function die(message) {
  console.error(`SHIDE ERR FATAL ${message}`);
  process.exit(19);
}

async function run() {
  const cwd = process.cwd();

  if (!cwd || cwd.length < 3) {
    die(`Expected current working directory to be at least 3 characters but got "${cwd}"`);
  }

  if (argCommand === 'invoke-from-ide') {
    const commandName = args[0];
    const inputArgsJson = args[1];

    if (!commandName) {
      die(`Command name is required`);
    }
    const commands = await getCommands(cwd);
    const match = commands[commandName];
    if (!match) {
      die(`Command name ${commandName} wasn't found in shide files.`);
    }

    let inputArgs = [];
    try {
      inputArgs = JSON.parse(inputArgsJson);
    } catch (e) {
      // Do nothing
    }

    await runShideCommand(match, inputArgs);
    const timer = setTimeout(() => {
      console.error(`SHIDE ERR FATAL Command returned but process remained open for 5 seconds.`);
      process.exit(19);
    }, 5000);
    timer.unref();
    console.log(`SHIDE SUCCESS NORMAL`);
    return;
  }

  die(`Command "${argCommand}" isn't known.`);
}

run();
