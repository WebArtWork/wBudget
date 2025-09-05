import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormService } from 'src/app/core/modules/form/form.service';
import { FormInterface } from 'src/app/core/modules/form/interfaces/form.interface';
import { TableModule } from 'src/app/core/modules/table/table.module';
import { TranslateService } from 'src/app/core/modules/translate/translate.service';
import { CrudComponent } from 'wacom';
import { budgetunitFormComponents } from '../../formcomponents/budgetunit.formcomponents';
import { Budgetunit } from '../../interfaces/budgetunit.interface';
import { BudgetunitService } from '../../services/budgetunit.service';
import { Router } from '@angular/router';

@Component({
	imports: [CommonModule, TableModule],
	templateUrl: './units.component.html',
	styleUrls: ['./units.component.scss']
})
export class UnitsComponent extends CrudComponent<
	BudgetunitService,
	Budgetunit,
	FormInterface
> {
	override configType: 'local' | 'server' = 'local';

	columns = ['name', 'cost', 'budget'];

	config = this.getConfig();

	budget = this._router.url.replace('/units/', '');

	constructor(
		_budgetunitService: BudgetunitService,
		_translate: TranslateService,
		_form: FormService,
		private _router: Router
	) {
		super(
			budgetunitFormComponents,
			_form,
			_translate,
			_budgetunitService,
			'Budgetunit'
		);

		this.setDocuments();
	}
	override preCreate(doc: Budgetunit): void {
		delete (doc as any).__creating;
		doc.budget = this.budget;
	}
}
