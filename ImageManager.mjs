class ImageManager {
    #notesFolderPath = '';
    #imagesFolderPath = '';

    constructor(notesFolderPath) {
        this.#notesFolderPath = notesFolderPath;
        this.#imagesFolderPath = path.join(this.#notesFolderPath, './assets/images/');
    }

    setNotesFolderPath() {
        
    }
}

export class PrimaryVaultImageManager extends ImageManager {    
    constructor() {
        super('./notes');
    }
}

export class SecondaryVaulImageManager extends ImageManager {
    constructor(vaultName) {

    }

    #getSecondaryVaultPath() {
        
    }
}