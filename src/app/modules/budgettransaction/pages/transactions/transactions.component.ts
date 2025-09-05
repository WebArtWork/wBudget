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
import { BudgetService } from 'src/app/modules/budget/services/budget.service';
import { Router } from '@angular/router';

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

	columns = ['isDeposit', 'amount', 'note', 'budget'];

	config = this.getConfig();
	budget = this._router.url.replace('/transactions/', '');
	constructor(
		_budgettransactionService: BudgettransactionService,
		_translate: TranslateService,
		_form: FormService,
		private _router: Router
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
	override preCreate(doc: Budgettransaction): void {
		delete (doc as any).__creating;
		doc.budget = this.budget;
	}
}
