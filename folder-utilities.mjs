import fs from 'fs';
import path from 'path';

export function findVaultNotesPaths(options) {
	const currentPath = options?.currentPath ?? process.cwd();

	const allNotesFolders = fs
		.readdirSync(currentPath, { recursive: true, withFileTypes: true })
		.filter(dirent => dirent.isDirectory() && dirent.name == 'notes')
		.map(dirent => ({
			fullPath: path.join(dirent.path, dirent.name),
			relativePathSteps: path.relative(currentPath, dirent.path).split('\\')
		}));

	const result = {};

	result.primaryVaultNotesPath = allNotesFolders
		.find(x => !x.relativePathSteps.includes('dependencies'))
		?.fullPath;

	const secondaryVaultEntries = allNotesFolders
		.filter(x => x.relativePathSteps.includes('dependencies'));
	result.secondaryVaultNotesPath = options?.secondaryVaultName
		? secondaryVaultEntries
			.find(el => el
				.relativePathSteps
				.splice(secondaryVaultEntries.indexOf('dependencies'))
				.includes(options.secondaryVaultName))
			?.fullPath
		: secondaryVaultEntries[0]?.fullPath; //if not provided take the first one found

	return result;
}

export function syncFiles(primaryVaultMgr, secondaryVaultMgr) {
	for (const missingImageName of secondaryVaultMgr.missingImages) {
		const srcImagePath = path.join(primaryVaultMgr.imagesFolderPath, missingImageName);

		if (!fs.existsSync(srcImagePath)) {
			continue;
		}

		const destImagePath = path.join(secondaryVaultMgr.imagesFolderPath, missingImageName);
		fs.copyFileSync(srcImagePath, destImagePath);

		if (primaryVaultMgr.unusedImages.includes(missingImageName)) {
			fs.rmSync(srcImagePath)
		}
	}
}

export function syncFilesSimulation(primaryVaultMgr, secondaryVaultMgr) {
	const toCopy = [];
	const toRemove = [];

	for (const missingImageName of secondaryVaultMgr.missingImages) {
		const srcImagePath = path.join(primaryVaultMgr.imagesFolderPath, missingImageName);

		if (!fs.existsSync(srcImagePath)) {
			continue;
		}

		toCopy.push(missingImageName);

		if (primaryVaultMgr.unusedImages.includes(missingImageName)) {
			toRemove.push(missingImageName);
		}
	}

	return { toCopy, toRemove };
}
