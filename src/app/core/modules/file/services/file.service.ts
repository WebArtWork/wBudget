import { Injectable } from '@angular/core';
import { File } from '../interfaces/file.interface';
import { FileService as WacomFileService } from 'wacom';
import { CrudService } from 'wacom';

@Injectable({
	providedIn: 'root'
})
export class FileService extends CrudService<File> {
	setFile: (dataUrl: string) => void;

	constructor(private _file: WacomFileService) {
		super({
			name: 'file'
		});
		this._file.add({
			id: 'formPhoto',
			// accept: 'image/*',
			resize: 1920,
			cb: (file: any) => {
				if (
					typeof file === 'string' &&
					typeof this.setFile === 'function'
				) {
					this.setFile(file);
				}
			}
		});

		this._file.add({
			id: 'formPhotos',
			// accept: 'image/*',
			multiple: true,
			resize: 1920,
			cb: (file: any) => {
				if (
					typeof file === 'string' &&
					typeof this.setFile === 'function'
				) {
					this.setFile(file);
				}
			}
		});
	}
}
