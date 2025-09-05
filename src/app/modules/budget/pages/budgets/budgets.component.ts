import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormService } from 'src/app/core/modules/form/form.service';
import { FormInterface } from 'src/app/core/modules/form/interfaces/form.interface';
import { TableModule } from 'src/app/core/modules/table/table.module';
import { TranslateService } from 'src/app/core/modules/translate/translate.service';
import { CrudComponent } from 'wacom';
import { budgetFormComponents } from '../../formcomponents/budget.formcomponents';
import { Budget } from '../../interfaces/budget.interface';
import { BudgetService } from '../../services/budget.service';

@Component({
	imports: [CommonModule, TableModule],
	templateUrl: './budgets.component.html',
	styleUrls: ['./budgets.component.scss']
})
export class BudgetsComponent extends CrudComponent<
	BudgetService,
	Budget,
	FormInterface
> {
	override configType: 'local' | 'server' = 'local';

	columns = ['name', 'description', 'amount', 'currency'];

	config = this.getConfig();

	constructor(
		_budgetService: BudgetService,
		_translate: TranslateService,
		_form: FormService
	) {
		super(
			budgetFormComponents,
			_form,
			_translate,
			_budgetService,
			'Budget'
		);

		this.setDocuments();
	}
}
