import { Platform } from '@angular/cdk/platform';
import { Component, inject, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Budget } from 'src/app/modules/budget/interfaces/budget.interface';
import { BudgetService } from 'src/app/modules/budget/services/budget.service';
import { budgettransactionFormComponents } from 'src/app/modules/budgettransaction/formcomponents/budgettransaction.formcomponents';
import { Budgettransaction } from 'src/app/modules/budgettransaction/interfaces/budgettransaction.interface';
import { BudgettransactionService } from 'src/app/modules/budgettransaction/services/budgettransaction.service';
import { UserService } from 'src/app/modules/user/services/user.service';
import { FormService } from '../../modules/form/form.service';
import { Budgetunit } from 'src/app/modules/budgetunit/interfaces/budgetunit.interface';
import { BudgetunitService } from 'src/app/modules/budgetunit/services/budgetunit.service';

@Component({
	selector: 'app-public',
	standalone: false,
	templateUrl: './public.component.html',
	styleUrls: ['./public.component.scss']
})
export class PublicComponent implements OnInit {
	showSidebar = false;
	budgets: Budget[] = [];
	units: Budgetunit[] = [];
	selectedBudgetId: string | null = localStorage.getItem('selectedBudgetId');
	selectedUnitId: string | null = null;

	ranges = ['day', 'week', 'month', 'year'];
	selectedRange: string = '';

	private _formService = inject(FormService);
	private _transactionService = inject(BudgettransactionService);
	private _budgetService = inject(BudgetService);
	private _budgetunitService = inject(BudgetunitService);
	private _platform = inject(Platform);
	public userService = inject(UserService);

	ngOnInit(): void {
		this.loadBudgets();
	}

	// ----------------- Sidebar -----------------
	hideSidebar(): void {
		if (!this._platform.ANDROID && !this._platform.IOS) {
			this.showSidebar = false;
		}
	}

	back(): void {
		window.history.back();
	}

	get selectedBudgetObj(): Budget | undefined {
		return this.budgets.find((b) => b._id === this.selectedBudgetId);
	}

	// ----------------- Select Handlers -----------------
	async loadBudgets() {
		try {
			this.budgets = await this._budgetService.getAllBudgets();
			console.log('budgets:', this.budgets);

			if (this.selectedBudgetId) {
				this.loadUnits(this.selectedBudgetId);
			}
		} catch (err) {
			console.error('Помилка завантаження бюджетів:', err);
		}
	}

	onBudgetChange(budgetId: string | null) {
		if (!budgetId) {
			this.units = [];
			this.selectedUnitId = null;
			localStorage.removeItem('selectedBudgetId');
			return;
		}

		this.selectedBudgetId = budgetId;
		localStorage.setItem('selectedBudgetId', budgetId);
		this.loadUnits(budgetId);
	}

	loadUnits(budgetId: string) {
		if (!budgetId) return;

		this._budgetunitService.getUnitsByBudget(budgetId).subscribe({
			next: (units: Budgetunit[]) => {
				this.units = units;
				this.selectedUnitId = null;
				console.log('Підтягнуті юніти:', this.units);
			},
			error: (err: any) =>
				console.error('Помилка завантаження юнітів:', err)
		});
	}

	onUnitChange(unitId: string) {
		this.selectedUnitId = unitId;
		const unit = this.units.find((u) => u._id === unitId);
		console.log('Вибраний юніт:', unit?.name);
	}

	onRangeChange() {
		console.log('Вибрано період:', this.selectedRange);
	}

	// ----------------- Transactions -----------------
	createTransaction() {
		this._formService.modal<Document>(budgettransactionFormComponents, {
			label: 'Create',
			click: async (created: unknown, close: () => void) => {
				close();

				await firstValueFrom(
					this._transactionService.create(
						created as Budgettransaction
					)
				);

				this.setDocuments();
			}
		});
	}

	setDocuments() {
		// оновити контент сторінки
	}
}
