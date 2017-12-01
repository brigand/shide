'use babel';

const os = require('os');
const cp = require('child_process');
const fs = require('fs');
const pify = require('util.promisify');
const exec = pify(cp.exec);
const readdir = pify(fs.readdir);

function getMajor(versionStr) {
  const parts = versionStr.replace(/[\D.]/g, '').split('.');
  const n = Number(parts[0]);
  return n;
}

async function getNodeExecutable() {
  let globalVersion = null;
  try {
    const globalNodePath = String((await exec(`which node`)).stdout).trim();
    globalVersion = String((await exec('node --version')).stdout).trim();
    if (getMajor(globalVersion) >= 8) {
      return globalNodePath;
    }
  } catch (e) {
  }

  const nvmDir = `${os.homedir()}/.nvm/versions`;
  let nvmVersions = null;
  try {
    nvmVersions = await readdir(nvmDir);
  } catch (e) {
    console.error(`SHIDE ERR FATAL expected node 8.x or later, but found global node ${globalVersion} and no ~/.nvm/versions`);
    process.exit(19);
  }
  for (const version of versions) {
    if (getMajor(version) >= 8) {
      return `${nvmDir}/${version}`;
    }
  }

  console.error(`SHIDE ERR FATAL expected node 8.x or later, but found global node ${globalVersion || '<none>'} and nvm versions ${nvmVersions && nvmVersions.length ? nvmVersions.join(', ') : '<none>'}`);
  process.exit(19);
}

module.exports = getNodeExecutable;
