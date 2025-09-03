import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormService } from 'src/app/core/modules/form/form.service';
import { FormInterface } from 'src/app/core/modules/form/interfaces/form.interface';
import { TableModule } from 'src/app/core/modules/table/table.module';
import { TranslateService } from 'src/app/core/modules/translate/translate.service';
import { CrudComponent } from 'wacom';
import { budgettransactionFormComponents } from '../../formcomponents/budgettransaction.formcomponents';
import { Budgettransaction } from '../../interfaces/budgettransaction.interface';
import { BudgettransactionService } from '../../services/budgettransaction.service';

@Component({
	imports: [CommonModule, TableModule],
	templateUrl: './transactions.component.html',
	styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent extends CrudComponent<
	BudgettransactionService,
	Budgettransaction,
	FormInterface
> {
	override configType: 'local' | 'server' = 'local';

	columns = ['name', 'amount', 'type', 'unitId', 'date'];

	config = this.getConfig();

	constructor(
		_budgettransactionService: BudgettransactionService,
		_translate: TranslateService,
		_form: FormService
	) {
		super(
			budgettransactionFormComponents,
			_form,
			_translate,
			_budgettransactionService,
			'Budgettransaction'
		);

		this.setDocuments();
	}
}
