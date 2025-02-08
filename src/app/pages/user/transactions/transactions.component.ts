import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { FormService } from 'src/app/core/modules/form/form.service';
import { FormInterface } from 'src/app/core/modules/form/interfaces/form.interface';
import { BudgetService } from 'src/app/modules/budget/services/budget.service';
import { budgettransactionFormComponents } from 'src/app/modules/budgettransaction/formcomponents/budgettransaction.formcomponents';
import { Budgettransaction } from 'src/app/modules/budgettransaction/interfaces/budgettransaction.interface';
import { BudgettransactionService } from 'src/app/modules/budgettransaction/services/budgettransaction.service';
import { UserService } from 'src/app/modules/user/services/user.service';

@Component({
	templateUrl: './transactions.component.html',
	styleUrls: ['./transactions.component.scss'],
	standalone: false
})
export class TransactionsComponent {
	isMenuOpen = false;

	transactions: Budgettransaction[] = [];

	budget_id = this._router.url.includes('transactions/')
		? this._router.url.replace('/alltransactions/', '')
		: '';

	budget = this.budget_id
		? this.budgetService.doc(this.budget_id)
		: this.budgetService.new();

	form: FormInterface = this._form.getForm(
		'budgettransaction',
		budgettransactionFormComponents
	);

	constructor(
		private _transactionService: BudgettransactionService,
		public budgetService: BudgetService,
		public _form: FormService,
		private _router: Router,
		public userService: UserService
	) {
		this.load();
	}

	create(): void {
		this._form.modal<Budgettransaction>(this.form, {
			label: 'Create',
			click: async (created: unknown, close: () => void) => {
				close();

				this._preCreate(created as Budgettransaction);

				await firstValueFrom(
					this._transactionService.create(
						created as Budgettransaction
					)
				);

				this.load();
			}
		});
	}

	load(): void {
		this._transactionService
			.get({
				query: this.budget_id ? 'budget=' + this.budget_id : ''
			})
			.subscribe((transactions) => (this.transactions = transactions));
	}

	private _preCreate(budgettransaction: Budgettransaction): void {
		budgettransaction.__created = false;

		budgettransaction.budget = this.budget_id;
	}
}
