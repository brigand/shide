'use babel';
import path from 'path';
import fs from 'fs';
import promisify from 'util.promisify';

const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);

async function getCommands(workDir) {
  const resolve = (...rest) => {
    return path.join(workDir, ...rest);
  };

  let shideDir = resolve('scripts/shide');
  let didSpecify = false;

  try {
    const packageJson = JSON.parse(await readFile(resolve('package.json'), 'utf-8'));
    if (packageJson && packageJson.shide) {
      shideDir = resolve(packageJson.shide);
      didSpecify = true;
    }
  } catch (e) {
  }

  let files = [];
  try {
    files = await readdir(shideDir);
  } catch (e) {
    if (didSpecify) {
      atom.notifications.addWarning(`Shide: Attempted to load shide files in "${shideDir}", specified in package.json, but not found.`);
    }
    return {};
  }

  const mapping = {};

  if (files.length) {
    for (const file of files) {
      if (!/\.json$/.test(file)) continue;
      const name = file.split('.').shift();
      const json = await readFile(`${shideDir}/${file}`, 'utf-8');
      let data;
      try {
        data = JSON.parse(json);
      } catch (e) {
        atom.notifications.addWarning(`Shide: Failed to parse ${file} as json`);
        continue;
      }
      const adjusted = Object.assign({ name }, data);
      adjusted.displayName = adjusted.displayName || name;
      adjusted.main = adjusted.main
        ? resolve(shideDir, adjusted.main)
        : resolve(shideDir, file.replace(/\.json$/, '.js'));

      mapping[name] = adjusted;
    }
  }

  return mapping;
}

export default getCommands;
