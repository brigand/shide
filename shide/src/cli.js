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
    if (!commandName) {
      die(`Command name is required`);
    }
    const commands = await getCommands(cwd);
    const match = commands[commandName];
    if (!match) {
      die(`Command name ${commandName} wasn't found in shide files.`);
    }

    await runShideCommand(match);
    console.log(`SHIDE SUCCESS`);
    process.exit(0);
  }

  die(`Command "${argCommand}" isn't known.`);
}
