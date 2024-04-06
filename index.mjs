#! /usr/bin/env node
import { getArgs } from './args-utilities.mjs'
import { findVaultNotesPaths } from './folder-utilities.mjs'
import { ImageManager } from './image-manager.mjs'

const args = getArgs();

const options = {
  secondaryVaultName: args.svn
}

const vaultPaths = findVaultNotesPaths(options);
const primaryVaultMgr = new ImageManager(vaultPaths.primaryVaultNotesPath);
const secondaryVaultMgr = new ImageManager(vaultPaths.secondaryVaultNotesPath);

console.log(primaryVaultMgr);
console.log(secondaryVaultMgr);
