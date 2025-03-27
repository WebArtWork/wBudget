import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormService } from '../../modules/form/form.service';

interface Interface {}

@Component({
	templateUrl: './html.component.html',
	styleUrls: ['./html.component.scss'],
	standalone: false
})
export class HtmlComponent implements OnInit {
	@ViewChild('templateRef', { static: true })
	templateRef: TemplateRef<Interface>;

	editorConfig = {
		height: 500,
		menubar: true,
		plugins: [
			'advlist autolink lists link image charmap print preview anchor',
			'searchreplace visualblocks code fullscreen',
			'insertdatetime media table paste code help wordcount'
		],
		toolbar:
			'undo redo | formatselect | bold italic backcolor | \
    alignleft aligncenter alignright alignjustify | \
    bullist numlist outdent indent | removeformat | help'
	};

	constructor(private _form: FormService) {}

	ngOnInit(): void {
		this._form.addTemplateComponent<Interface>('Html', this.templateRef);
	}
}
