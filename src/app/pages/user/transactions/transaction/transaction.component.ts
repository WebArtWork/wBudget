import { Component, EventEmitter, Input, Output } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormService } from 'src/app/core/modules/form/form.service';
import { FormInterface } from 'src/app/core/modules/form/interfaces/form.interface';
import { TranslateService } from 'src/app/core/modules/translate/translate.service';
import { BudgetService } from 'src/app/modules/budget/services/budget.service';
import { budgettransactionFormComponents } from 'src/app/modules/budgettransaction/formcomponents/budgettransaction.formcomponents';
import { Budgettransaction } from 'src/app/modules/budgettransaction/interfaces/budgettransaction.interface';
import { BudgettransactionService } from 'src/app/modules/budgettransaction/services/budgettransaction.service';
import { AlertService, CoreService } from 'wacom';

@Component({
	selector: 'app-transaction',
	standalone: false,
	templateUrl: './transaction.component.html',
	styleUrl: './transaction.component.scss'
})
export class TransactionComponent {
	@Input() transaction: Budgettransaction;

	@Input() budget_id: string;

	@Output() reload = new EventEmitter();

	form: FormInterface = this._form.getForm(
		'budgettransaction',
		budgettransactionFormComponents
	);

	constructor(
		private _budgettransactionService: BudgettransactionService,
		private _translate: TranslateService,
		public budgetService: BudgetService,
		private _alert: AlertService,
		private _core: CoreService,
		private _form: FormService
	) {}

	edit(): void {
		this._form
			.modal<Budgettransaction>(this.form, [], this.transaction)
			.then((updated: Budgettransaction) => {
				this._core.copy(updated, this.transaction);

				this._budgettransactionService.update(this.transaction);
			});
	}

	delete(): void {
		this._alert.question({
			text: this._translate.translate(
				'Common.Are you sure you want to delete this budgettransaction?'
			),
			buttons: [
				{
					text: this._translate.translate('Common.No')
				},
				{
					text: this._translate.translate('Common.Yes'),
					callback: async (): Promise<void> => {
						await firstValueFrom(
							this._budgettransactionService.delete(
								this.transaction
							)
						);

						this.reload.emit();
					}
				}
			]
		});
	}
}
