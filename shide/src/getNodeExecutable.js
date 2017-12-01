'use babel';

const os = require('os');
const cp = require('child_process');
const fs = require('fs');
const pify = require('util.promisify');
const exec = pify(cp.exec);
const readdir = pify(fs.readdir);

function getMajor(versionStr) {
  const parts = versionStr.replace(/[^\d.]/g, '').split('.');
  const n = Number(parts[0]);
  return n;
}

async function getNodeExecutable(die) {
  let globalVersion = null;
  try {
    const globalNodePath = String((await exec(`which node`)).stdout).trim();
    globalVersion = String((await exec('node --version')).stdout).trim();
    if (getMajor(globalVersion) >= 8) {
      return globalNodePath;
    }
  } catch (e) {
    // Do nothing
  }

  const nvmDir = `${os.homedir()}/.nvm/versions/node`;
  let nvmVersions = null;
  try {
    nvmVersions = await readdir(nvmDir);
  } catch (e) {
    die(`expected node 8.x or later, but found global node ${globalVersion} and no ~/.nvm/versions/node`);
  }
  for (const version of nvmVersions) {
    if (getMajor(version) >= 8) {
      return `${nvmDir}/${version}/bin/node`;
    }
  }

  die(`expected node 8.x or later, but found global node ${globalVersion || '<none>'} and nvm versions ${nvmVersions && nvmVersions.length ? nvmVersions.join(', ') : '<none>'}`);
}

module.exports = getNodeExecutable;
