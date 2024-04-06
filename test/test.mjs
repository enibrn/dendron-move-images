import { describe, it } from "node:test"
import assert from "node:assert"
import fs from 'fs';
import path from 'path';
import { findVaultNotesPaths } from './../folder-utilities.mjs'


function getPrimaryVaultCopyPath() {
  return path.join(process.cwd(), 'test', 'primary-vault-copy');
}

function getPrimaryVaultPath() {
  return path.join(process.cwd(), 'test', 'primary-vault');
}

function initTestFiles() {
  const destFolderPath = getPrimaryVaultCopyPath();

  if (!fs.existsSync(destFolderPath)) {
    fs.mkdirSync(destFolderPath);
  }

  const folderToCopyPath = getPrimaryVaultPath();
  fs.cpSync(folderToCopyPath, destFolderPath, { recursive: true });
}

function disposeTestFiles() {
  const destFolderPath = getPrimaryVaultCopyPath();

  if (fs.existsSync(destFolderPath)) {
    fs.rmSync(destFolderPath, { recursive: true, force: true });
  }
}

describe("findVaultsPaths", () => {
  it("is the default case", () => {
    const primaryVaultPath = getPrimaryVaultPath();
    const primaryVaultNotesPathExpected = path.join(primaryVaultPath, 'notes');
    const secondaryVaultNotesPathExpected = path.join(primaryVaultPath, 'dependencies', 'folder', 'other-vault', 'notes');

    const vaultPaths = findVaultNotesPaths();
    assert.strictEqual(vaultPaths.primaryVaultNotesPath, primaryVaultNotesPathExpected);
    assert.strictEqual(vaultPaths.secondaryVaultNotesPath, secondaryVaultNotesPathExpected);
  });

  it("has the secondaryVaultName defined", () => {
    const primaryVaultPath = getPrimaryVaultPath();
    const primaryVaultNotesPathExpected = path.join(primaryVaultPath, 'notes');
    const secondaryVaultNotesPathExpected = path.join(primaryVaultPath, 'dependencies', 'folder1','folder2', 'secondary-vault', 'notes');

    const options = {
      secondaryVaultName: 'secondary-vault'
    };
    const vaultPaths = findVaultNotesPaths(options);
    assert.strictEqual(vaultPaths.primaryVaultNotesPath, primaryVaultNotesPathExpected);
    assert.strictEqual(vaultPaths.secondaryVaultNotesPath, secondaryVaultNotesPathExpected);
  });

  it("is the default case, simulate exec in primaryvault", () => {
    const primaryVaultPath = getPrimaryVaultPath();
    const primaryVaultNotesPathExpected = path.join(primaryVaultPath, 'notes');
    const secondaryVaultNotesPathExpected = path.join(primaryVaultPath, 'dependencies', 'folder', 'other-vault', 'notes');

    const options = {
      currentPath: primaryVaultPath
    };
    const vaultPaths = findVaultNotesPaths(options);
    assert.strictEqual(vaultPaths.primaryVaultNotesPath, primaryVaultNotesPathExpected);
    assert.strictEqual(vaultPaths.secondaryVaultNotesPath, secondaryVaultNotesPathExpected);
  });

  it("has the secondaryVaultName defined, simulate exec in primaryvault", () => {
    const primaryVaultPath = getPrimaryVaultPath();
    const primaryVaultNotesPathExpected = path.join(primaryVaultPath, 'notes');
    const secondaryVaultNotesPathExpected = path.join(primaryVaultPath, 'dependencies', 'folder1','folder2', 'secondary-vault', 'notes');

    const options = {
      currentPath: primaryVaultPath,
      secondaryVaultName: 'secondary-vault'
    };
    const vaultPaths = findVaultNotesPaths(options);
    assert.strictEqual(vaultPaths.primaryVaultNotesPath, primaryVaultNotesPathExpected);
    assert.strictEqual(vaultPaths.secondaryVaultNotesPath, secondaryVaultNotesPathExpected);
  });
});
