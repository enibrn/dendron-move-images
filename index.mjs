#! /usr/bin/env node

// console.log(process.cwd());
import { Command } from 'commander';
import figlet from "figlet";

console.log(figlet.textSync("Dendron Move Images"));

const program = new Command();
program
  .name('dendron-move-images')
  .description('Utility to move dendron images')
  .version('0.1.0');

program
  .option('-svn, --secondary-vault-name [type]', 'Add secondary vault name')
  .option('-svdf, --secondary-vault-dendron-folder [type]', 'Add secondary vault dendron folder')

program.parse();
const options = program.opts();
// console.log('secondaryVaultName', options.secondaryVaultName);
// console.log('secondaryVaultDendronFolder', options.secondaryVaultDendronFolder);

 