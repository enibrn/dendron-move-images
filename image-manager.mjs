import path from 'path';
import fs from 'fs';

export class ImageManager {
	imagesFolderPath;
	notesFolderPath;

	imagesInAssets = [];

	localImagesInNotes = [];
	unknownImagesInNotes = [];

	missingImages = [];
	unusedImages = [];
	wrongCaseImages = [];

	constructor(notesFolderPath) {
		this.#setPaths(notesFolderPath);
		this.#setImagesInAssets();
		this.#setImagesInNotes();
		this.#setMissingAndUnusedImages();
	}

	#setPaths(notesFolderPath) {
		this.notesFolderPath = notesFolderPath;
		this.imagesFolderPath = path.join(notesFolderPath, './assets/images/');
	}

	#setImagesInAssets() {
		this.imagesInAssets = fs
			.readdirSync(this.imagesFolderPath, { withFileTypes: true })
			.map(dirent => ({ name: dirent.name, path: path.join(dirent.path, dirent.name) }));
	}

	#setImagesInNotes() {
		const imageRegex = /!\[([^\]]+)\]\(([^)]+)\)/g;
		const webPrefixes = ['http://', 'https://'];
		const validLocalPrefixes = ['./assets/images/', '/assets/images/', 'assets/images/'];

		const markdownFiles = fs
			.readdirSync(this.notesFolderPath)
			.filter(file => file.endsWith('.md'));

		markdownFiles.forEach(file => {
			const filePath = path.join(this.notesFolderPath, file);
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

	#setMissingAndUnusedImages() {
		const localImageNamesInNotes = this.localImagesInNotes.map(x => x.name);
		//removes duplicates (works only with primitives)
		const localImageNamesInNotesDistinct = [...new Set(localImageNamesInNotes)];

		const imageNamesInAssets = this.imagesInAssets.map(x => x.name);

		this.missingImages = localImageNamesInNotesDistinct
			.filter(x => !imageNamesInAssets.includes(x));
		this.unusedImages = imageNamesInAssets
			.filter(x => !localImageNamesInNotesDistinct.includes(x));

		this.wrongCaseImages = imageNamesInAssets
			.map(fileImage => {
				const wrongCaseLinks = localImageNamesInNotesDistinct
					.filter(noteImage => noteImage.toLowerCase() === fileImage.toLowerCase() && noteImage !== fileImage);

				return { fileImage, wrongCaseLinks };
			})
			.filter(x => x.wrongCaseLinks.length > 0);
	}
}
