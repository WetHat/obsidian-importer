import { Notice } from 'obsidian';
import { FormatImporter } from '../format-importer';
import { ImportContext } from '../main';
import { EpubBook } from './ebooks/epub/epub-import';

export class EbookImporter extends FormatImporter {
	init(): void {
		// configure the import dialog
		this.addFileChooserSetting('E-book file', ['epub']);
		this.addOutputLocationSetting('e-books');
	}

	async import(ctx: ImportContext): Promise<any> {
		const { vault, files } = this;
		if (files.length === 0) {
			new Notice('Please pick at least one file to import.');
			return;
		}

		const outputFolder = await this.getOutputFolder();
		if (!outputFolder) {
			new Notice('Please select an import location.');
			return;
		}

		for (const file of files) {
			switch(file.extension) {
				case 'epub':
					const epub = new EpubBook(ctx);
					await epub.import(outputFolder,file);
					break;
			}
		}
	}
}