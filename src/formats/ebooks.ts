import { Notice } from "obsidian";
import { FormatImporter } from "../format-importer";
import { ImportContext } from "../main";
import { EpubParser } from "./ebooks/epub/epub-parser";

export class EbookImporter extends FormatImporter {
    init(): void {
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
			new Notice('Please select a location to export to.');
			return;
		}

        for (const file of files) {
            const parser = new EpubParser(vault,ctx);
            await parser.import(file,outputFolder);
        }

        ctx.reportNoteSuccess(files[0].fullpath);
    }
}