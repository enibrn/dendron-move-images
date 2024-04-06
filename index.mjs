#! /usr/bin/env node
import { getArgs } from './args-utilities.mjs'
import { findVaultNotesPaths, syncFiles, syncFilesSimulation } from './folder-utilities.mjs'
import { ImageManager } from './image-manager.mjs'
import readline from 'node:readline/promises';

const args = getArgs();

const options = {
  secondaryVaultName: args.svn
}

const vaultPaths = findVaultNotesPaths(options);
const primaryVaultMgr = new ImageManager(vaultPaths.primaryVaultNotesPath);
const secondaryVaultMgr = new ImageManager(vaultPaths.secondaryVaultNotesPath);

if (await haveToSync(args, primaryVaultMgr, secondaryVaultMgr)) {
  console.log("do the sync");
}

async function haveToSync(args, primaryVaultMgr, secondaryVaultMgr) {
  if (args.y)
    return true; //skip confirm

  const simResult = syncFilesSimulation(primaryVaultMgr, secondaryVaultMgr);

  const nothingToCopy = simResult.toCopy.length === 0;
  const nothingToRemove = simResult.toRemove.length === 0;
  if (nothingToCopy && nothingToRemove) {
    console.log('Nothing to sync');
    return false;
  }

  if (nothingToCopy) {
    console.log('Nothing to copy');
  } else {
    console.log('Images to copy:');
    console.log(simResult.toCopy);
  }

  if (nothingToRemove) {
    console.log('Nothing to remove');
  } else {
    console.log('Images to remove:');
    console.log(simResult.toRemove);
  }

  const rl = readline.createInterface({input:process.stdin, output:process.stdout});
  const response = await rl.question("Confirm? (Y/N)");
  rl.close();

  return response?.toLowerCase() === 'y';
}