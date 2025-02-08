import { Component, Input } from '@angular/core';
import { FormService } from 'src/app/core/modules/form/form.service';
import { FormInterface } from 'src/app/core/modules/form/interfaces/form.interface';
import { TranslateService } from 'src/app/core/modules/translate/translate.service';
import { budgetFormComponents } from 'src/app/modules/budget/formcomponents/budget.formcomponents';
import { Budget } from 'src/app/modules/budget/interfaces/budget.interface';
import { BudgetService } from 'src/app/modules/budget/services/budget.service';
import { AlertService, CoreService } from 'wacom';

@Component({
	selector: 'app-budget',
	standalone: false,

	templateUrl: './budget.component.html',
	styleUrl: './budget.component.scss'
})
export class BudgetComponent {
	@Input() budget: Budget;

	form: FormInterface = this._form.getForm('budget', budgetFormComponents);

	constructor(
		private _form: FormService,
		private _core: CoreService,
		private _alert: AlertService,
		private _translate: TranslateService,
		private _budgetService: BudgetService
	) {}

	edit(): void {
		this._form
			.modal<Budget>(this.form, [], this.budget)
			.then((updated: Budget) => {
				this._core.copy(updated, this.budget);

				this._budgetService.update(this.budget);
			});
	}

	delete(): void {
		this._alert.question({
			text: this._translate.translate(
				'Common.Are you sure you want to delete this budget?'
			),
			buttons: [
				{
					text: this._translate.translate('Common.No')
				},
				{
					text: this._translate.translate('Common.Yes'),
					callback: (): void => {
						this._budgetService.delete(this.budget);
					}
				}
			]
		});
	}
}
