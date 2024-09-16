import { describe, it } from "node:test"
import assert from "node:assert"

import fs from 'fs';
import path from 'path';

import { findVaultNotesPaths, syncFilesSimulation, syncFiles } from './../folder-utilities.mjs'
import { ImageManager } from './../image-manager.mjs'

function getPrimaryVaultCopyPath() {
  return path.join(process.cwd(), 'test', 'primary-vault-copy');
}

function getPrimaryVaultPath() {
  return path.join(process.cwd(), 'test', 'primary-vault');
}

function initTestFiles() {
  const destFolderPath = getPrimaryVaultCopyPath();

  if (fs.existsSync(destFolderPath)) {
    fs.rmSync(destFolderPath, { recursive: true, force: true });
  }

  fs.mkdirSync(destFolderPath);

  const folderToCopyPath = getPrimaryVaultPath();
  fs.cpSync(folderToCopyPath, destFolderPath, { recursive: true });
}

function disposeTestFiles() {
  const destFolderPath = getPrimaryVaultCopyPath();

  if (fs.existsSync(destFolderPath)) {
    fs.rmSync(destFolderPath, { recursive: true, force: true });
  }
}

function areEqual(array1, array2) {
  if (array1.length === array2.length) {
    return array1.every((element, index) => {
      if (element === array2[index]) {
        return true;
      }

      return false;
    });
  }

  return false;
}

function areEqualRegardlessOrder(array1, array2) {
  if (array1.length === array2.length) {
    return array1.every(element => {
      if (array2.includes(element)) {
        return true;
      }

      return false;
    });
  }

  return false;
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
    const secondaryVaultNotesPathExpected = path.join(primaryVaultPath, 'dependencies', 'folder1', 'folder2', 'secondary-vault', 'notes');

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
    const secondaryVaultNotesPathExpected = path.join(primaryVaultPath, 'dependencies', 'folder1', 'folder2', 'secondary-vault', 'notes');

    const options = {
      currentPath: primaryVaultPath,
      secondaryVaultName: 'secondary-vault'
    };
    const vaultPaths = findVaultNotesPaths(options);
    assert.strictEqual(vaultPaths.primaryVaultNotesPath, primaryVaultNotesPathExpected);
    assert.strictEqual(vaultPaths.secondaryVaultNotesPath, secondaryVaultNotesPathExpected);
  });
});

describe("dendron move notes", () => {
  it("move terra", () => {
    initTestFiles();
    const primaryVaultPath = getPrimaryVaultCopyPath();
    const options = {
      currentPath: primaryVaultPath,
      secondaryVaultName: 'secondary-vault'
    };
    const vaultPaths = findVaultNotesPaths(options);

    // mock the dendron move between vaults
    const srcPath = path.join(vaultPaths.primaryVaultNotesPath, 'terra.md');
    const destPath = path.join(vaultPaths.secondaryVaultNotesPath, 'terra.md');
    fs.renameSync(srcPath, destPath);

    const primaryVaultMgr = new ImageManager(vaultPaths.primaryVaultNotesPath);
    const secondaryVaultMgr = new ImageManager(vaultPaths.secondaryVaultNotesPath);
    console.log(primaryVaultMgr);
    console.log(secondaryVaultMgr);

    //syncFilesSimulation tests
    const simResult = syncFilesSimulation(primaryVaultMgr, secondaryVaultMgr);

    const expectedToCopy = ['terra.jpg', 'Terra-vs-Venere.jpg'];
    assert.strictEqual(areEqualRegardlessOrder(simResult.toCopy, expectedToCopy), true);

    const expectedToRemove = ['terra.jpg'];
    assert.strictEqual(areEqualRegardlessOrder(simResult.toRemove, expectedToRemove), true);

    //sync tests
    syncFiles(primaryVaultMgr, secondaryVaultMgr);

    for (const imgCopied of expectedToCopy) {
      const pathImgCopiedInSecondaryVault = path.join(secondaryVaultMgr.imagesFolderPath, imgCopied);
      assert.strictEqual(fs.existsSync(pathImgCopiedInSecondaryVault), true); //shoud exist now
    }

    for (const imgRemoved of expectedToRemove) {
      const pathImgRemovedInPrimaryVault = path.join(primaryVaultMgr.imagesFolderPath, imgRemoved);
      assert.strictEqual(fs.existsSync(pathImgRemovedInPrimaryVault), false); //shoud not exist anymore
    }

    disposeTestFiles();
  })
});
