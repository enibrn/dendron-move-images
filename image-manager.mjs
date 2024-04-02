import path from 'path';
import fs from 'fs';

export class ImageManager {
	imagesInAssets = [];
	localImagesInNotes = [];
	unknownImagesInNotes = [];

	missingImages = [];
	unusedImages = [];

	constructor(notesFolderPath) {
		this.#setImagesInAssets(notesFolderPath);
		this.#setImagesInNotes(notesFolderPath);
		this.#setMissingUnusedImages();
	}

	#setImagesInAssets(notesFolderPath) {
		const imagesFolderPath = path.join(notesFolderPath, './assets/images/');
		this.imagesInAssets = fs
			.readdirSync(imagesFolderPath, { withFileTypes: true })
			.map(dirent => ({ name: dirent.name, path: path.join(dirent.path, dirent.name) }));
	}

	#setImagesInNotes(notesFolderPath) {
		const imageRegex = /!\[([^\]]+)\]\(([^)]+)\)/g;
		const webPrefixes = ['http://', 'https://'];
		const validLocalPrefixes = ['./assets/images/', 'assets/images/'];

		const markdownFiles = fs
			.readdirSync(notesFolderPath)
			.filter(file => file.endsWith('.md'));

		markdownFiles.forEach(file => {
			const filePath = path.join(notesFolderPath, file);
			const fileContent = fs.readFileSync(filePath, 'utf-8');

			let match;
			while ((match = imageRegex.exec(fileContent)) !== null) {
				if (isInCodeBlock(match))
					continue;

				const imageObj = { link: match[2] };
				if (webPrefixes.some(x => imageObj.link.startsWith(x)))
					continue;

				imageObj.name = imageObj.link.split('/').pop();
				if (validLocalPrefixes.some(x => imageObj.link.startsWith(x))) {
					this.localImagesInNotes.push(imageObj);
				} else {
					this.unknownImagesInNotes.push(imageObj)
				}
			}
		});

		function isInCodeBlock(match) {
			const stringBeforeMatch = match.input.substring(0, match.index);
			const numOfBackTicks = (stringBeforeMatch.match(/`/g) || []).length;
			return numOfBackTicks % 2 !== 0;
		}
	}

	#setMissingUnusedImages() {
		const localImageNamesInNotes = this.localImagesInNotes.map(x => x.name.toLowerCase());
		const imageNamesInAssets = this.imagesInAssets.map(x => x.name.toLowerCase());

		this.missingImages = localImageNamesInNotes.filter(x => !imageNamesInAssets.includes(x));
		this.unusedImages = imageNamesInAssets.filter(x => !localImageNamesInNotes.includes(x));
	}
}
