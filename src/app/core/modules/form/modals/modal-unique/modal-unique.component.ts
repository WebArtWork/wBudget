import { Component } from '@angular/core';
import { FormInterface } from '../../interfaces/form.interface';
import { HttpService } from 'wacom';

@Component({
	selector: 'app-modal-unique',
	templateUrl: './modal-unique.component.html',
	styleUrls: ['./modal-unique.component.scss'],
	standalone: false
})
export class ModalUniqueComponent {
	constructor(private _http: HttpService) {}
	form: FormInterface;
	module: string;
	field: string;
	name: string;
	// eslint-disable-next-line
	doc: any;
	get getDoc(): Record<string, unknown> {
		return this.doc as Record<string, unknown>;
	}
	change(): void {
		this._http
			.post(
				'/api/' + this.module + '/unique' + (this.field || ''),
				this.doc
			)
			.subscribe((resp: string) => {
				if (this.doc[this.field] !== resp) {
					this.doc[this.field] = resp;
				}
			});
	}
}
