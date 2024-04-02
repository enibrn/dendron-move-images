#! /usr/bin/env node
import { getArgs } from './args-utilities.mjs'
import { findVaultsPaths } from './folder-utilities.mjs'
import { ImageManager } from './image-manager.mjs'

const args = getArgs();

const vaultPaths = await findVaultsPaths('secondary-vault');
const primaryVaultMgr = new ImageManager(vaultPaths.primaryVaultPath);
const secondaryVaultMgr = new ImageManager(vaultPaths.secondaryVaultPath);

console.log(primaryVaultMgr);
console.log(secondaryVaultMgr);
