import { Component } from '@angular/core';
import { FormService } from 'src/app/core/modules/form/form.service';
import { FormInterface } from 'src/app/core/modules/form/interfaces/form.interface';
import { TableModule } from 'src/app/core/modules/table/table.module';
import { TranslateService } from 'src/app/core/modules/translate/translate.service';
import { CrudComponent } from 'wacom';
import { budgetFormComponents } from '../../formcomponents/budget.formcomponents';
import { Budget } from '../../interfaces/budget.interface';
import { BudgetService } from '../../services/budget.service';
import { BudgettransactionService } from 'src/app/modules/budgettransaction/services/budgettransaction.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
	imports: [TableModule],
	standalone: true,
	templateUrl: './budgets.component.html',
	styleUrls: ['./budgets.component.scss']
})
export class BudgetsComponent extends CrudComponent<
	BudgetService,
	Budget,
	FormInterface
> {
	budgets: Budget[] = [];
	override configType: 'local' | 'server' = 'local';
	columns = ['name', 'description', 'amount', 'currency'];
	config = this.getConfig();

	override allowUrl(): boolean {
		return false;
	}

	constructor(
		private _budgetService: BudgetService,
		private _translate: TranslateService,
		private _form: FormService,
		public router: Router,
		private _budgettransactionService: BudgettransactionService
	) {
		super(
			budgetFormComponents,
			_form,
			_translate,
			_budgetService,
			'Budget'
		);

		this.config.buttons.unshift({
			icon: 'add',
			click: () => this.createBudget()
		});

		this.config.buttons.push({
			icon: 'category',
			hrefFunc: (doc: Budget) =>
				doc._id ? '/units/' + doc._id : '/units'
		});
		this.config.buttons.push({
			icon: 'swap_horiz',
			hrefFunc: (doc: Budget) =>
				doc._id ? '/transactions/' + doc._id : '/transactions'
		});
		this.config.buttons.push({
			icon: 'edit',
			click: (doc: Budget) => this.editBudget(doc)
		});
		this.config.buttons.push({
			icon: 'delete',
			click: (doc: Budget) => this.deleteBudget(doc)
		});

		this.setDocuments();
	}

	handleButtonClick(btn: any, budget?: Budget) {
		if (btn.hrefFunc) {
			const url = budget ? btn.hrefFunc(budget) : btn.hrefFunc();
			this.router.navigateByUrl(url);
		} else if (btn.click && budget !== undefined) {
			btn.click(budget);
		} else if (btn.click) {
			btn.click();
		}
	}

	override async setDocuments() {
		this.documents = await this._budgetService.getAllBudgets();

		const allTransactionsMap: { [budgetId: string]: any[] } = {};

		for (const budget of this.documents) {
			allTransactionsMap[budget._id] = await firstValueFrom(
				this._budgettransactionService.getTransactionsByBudget(
					budget._id
				)
			);
		}

		for (const budget of this.documents) {
			if ((budget as any).initialAmount === undefined) {
				(budget as any).initialAmount = Number(budget.amount) || 0;
			}

			const txs = allTransactionsMap[budget._id];
			const txSum = txs.reduce((sum, t) => {
				const sign = t.isDeposit ? 1 : -1;
				if (t.unitId) return sum + sign * t.amount;
				if (t.units && Array.isArray(t.units)) {
					const sumUnits = (t.units as { amount?: number }[]).reduce(
						(s, u) => s + (u.amount || 0),
						0
					);
					return sum + sign * sumUnits;
				}
				return sum + sign * t.amount;
			}, 0);

			budget.amount = (budget as any).initialAmount + txSum;
		}
	}

	async onTransactionCreated(transaction: any) {
		const budget = this.documents.find((b) => b._id === transaction.budget);
		if (!budget) return;

		if ((budget as any).initialAmount === undefined) {
			(budget as any).initialAmount = Number(budget.amount) || 0;
		}

		const txs = await firstValueFrom(
			this._budgettransactionService.getTransactionsByBudget(budget._id)
		);

		const txSum = txs.reduce((sum, t) => {
			const sign = t.isDeposit ? 1 : -1;
			if (t.unitId) return sum + sign * t.amount;
			if (t.units && Array.isArray(t.units)) {
				const sumUnits = (t.units as { amount?: number }[]).reduce(
					(s, u) => s + (u.amount || 0),
					0
				);
				return sum + sign * sumUnits;
			}
			return sum + sign * t.amount;
		}, 0);

		budget.amount = (budget as any).initialAmount + txSum;
	}

	createBudget() {
		const formComponents = JSON.parse(JSON.stringify(budgetFormComponents));
		(this._form as FormService).modal<Budget>(formComponents, [
			{
				label: 'Create',
				click: (submitted: unknown, close: () => void) => {
					const created = submitted as Budget;
					this._budgetService.create(created).subscribe({
						next: async () => {
							await this.setDocuments();
							close();
						},
						error: (err) =>
							console.error('Error creating budget:', err)
					});
				}
			}
		]);
	}

	editBudget(budget: Budget) {
		const formComponents = JSON.parse(JSON.stringify(budgetFormComponents));
		(this._form as FormService).modal<Budget>(
			formComponents,
			[
				{
					label: 'Update',
					click: async (submitted: unknown, close: () => void) => {
						const updated = submitted as Budget;
						this._budgetService.update(updated).subscribe({
							next: async () => {
								await this.setDocuments();
								close();
							},
							error: (err) =>
								console.error('Error updating budget:', err)
						});
					}
				}
			],
			budget
		);
	}

	deleteBudget(budget: Budget) {
		if (!budget._id) return;
		if (confirm(`Delete budget "${budget.name}"?`)) {
			this._budgetService.delete(budget).subscribe(() => {
				this.documents = this.documents.filter(
					(b) => b._id !== budget._id
				);
			});
		}
	}

	goToDashboard(budget: Budget) {
		localStorage.setItem('selectedBudgetId', budget._id);
		localStorage.setItem('selectedBudgetName', budget.name);

		this.router.navigate(['/dashboard'], {
			queryParams: { budget: budget._id }
		});

		window.dispatchEvent(
			new CustomEvent('budgetChanged', { detail: budget })
		);
	}
}
