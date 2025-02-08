import { Component } from '@angular/core';
import { FormService } from 'src/app/core/modules/form/form.service';
import { FormInterface } from 'src/app/core/modules/form/interfaces/form.interface';
import { budgetFormComponents } from 'src/app/modules/budget/formcomponents/budget.formcomponents';
import { Budget } from 'src/app/modules/budget/interfaces/budget.interface';
import { BudgetService } from 'src/app/modules/budget/services/budget.service';
import { UserService } from 'src/app/modules/user/services/user.service';

@Component({
	templateUrl: './budgets.component.html',
	styleUrls: ['./budgets.component.scss'],
	standalone: false
})
export class BudgetsComponent {
	isMenuOpen = false;

	form: FormInterface = this._form.getForm('budget', budgetFormComponents);

	constructor(
		public budgetService: BudgetService,
		private _form: FormService,
		public userService: UserService
	) {}

	create(): void {
		this._form.modal<Budget>(this.form, {
			label: 'Create',
			click: (created: unknown, close: () => void) => {
				this._preCreate(created as Budget);

				this.budgetService.create(created as Budget);

				close();
			}
		});
	}

	private _preCreate(budget: Budget): void {
		budget.__created = false;
	}
}
