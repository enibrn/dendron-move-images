import { readdir } from 'node:fs/promises';
import path from 'path';

export async function findVaultsPaths(secondaryVaultName) {
	const currentPath = process.cwd();
	const result = {};

	const allNotesFolders = (await readdir(currentPath, { recursive: true, withFileTypes: true }))
		.filter(dirent => dirent.isDirectory() && dirent.name == 'notes')
		.map(dirent => ({
			fullPath: path.join(dirent.path, dirent.name),
			relativePathSteps: path.relative(currentPath, dirent.path).split('\\')
		}));

	result.primaryVaultPath = allNotesFolders
		.find(x => !x.relativePathSteps.includes('dependencies'))
		?.fullPath;

	const secondaryVaultEntries = allNotesFolders
		.filter(x => x.relativePathSteps.includes('dependencies'));

	result.secondaryVaultPath = secondaryVaultName
		? secondaryVaultEntries
			.find(el => el
				.relativePathSteps
				.splice(secondaryVaultEntries.indexOf('dependencies'))
				.includes(secondaryVaultName))
			?.fullPath
		: secondaryVaultEntries[0]?.fullPath;

	return result;
}