import { Component } from '@angular/core';
import { AlertService, CoreService } from 'wacom';
import { FileService } from '../../services/file.service';
import { File } from '../../interfaces/file.interface';
import { FormService } from 'src/app/core/modules/form/form.service';
import { TranslateService } from 'src/app/core/modules/translate/translate.service';
import { FormInterface } from 'src/app/core/modules/form/interfaces/form.interface';
import { fileFormComponents } from '../../formcomponents/file.formcomponents';
import { firstValueFrom } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
	templateUrl: './files.component.html',
	styleUrls: ['./files.component.scss'],
	standalone: false
})
export class FilesComponent {
	columns = ['img', 'url'];

	form: FormInterface = this._form.getForm('file', fileFormComponents);

	config = {
		paginate: this.setRows.bind(this),
		perPage: 20,
		setPerPage: this._fileService.setPerPage.bind(this._fileService),
		allDocs: false,
		create: (): void => {
			this._form.modal<File>(this.form, {
				label: 'Create',
				click: async (created: unknown, close: () => void) => {
					close();

					this._preCreate(created as File);

					await firstValueFrom(
						this._fileService.create(created as File)
					);

					this.setRows();
				}
			});
		},
		delete: (doc: File): void => {
			this._alert.question({
				text: this._translate.translate(
					'Common.Are you sure you want to delete this file?'
				),
				buttons: [
					{
						text: this._translate.translate('Common.No')
					},
					{
						text: this._translate.translate('Common.Yes'),
						callback: async (): Promise<void> => {
							await firstValueFrom(this._fileService.delete(doc));

							this.setRows();
						}
					}
				]
			});
		}
	};

	rows: File[] = [];

	constructor(
		private _translate: TranslateService,
		private _fileService: FileService,
		private _clipboard: Clipboard,
		private _alert: AlertService,
		private _form: FormService,
		private _core: CoreService
	) {
		this.setRows();
	}

	copy(text: string): void {
		this._clipboard.copy(text);

		this._alert.info({
			text: 'Url has been copied'
		});
	}

	setRows(page = this._page): void {
		this._page = page;

		this._core.afterWhile(
			this,
			() => {
				this._fileService.get({ page }).subscribe((rows) => {
					this.rows.splice(0, this.rows.length);

					this.rows.push(...rows);
				});
			},
			250
		);
	}

	private _page = 1;

	private _preCreate(file: File): void {
		delete file.__created;
	}
}
