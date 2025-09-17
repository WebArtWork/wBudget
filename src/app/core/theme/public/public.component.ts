import { Platform } from '@angular/cdk/platform';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Budget } from 'src/app/modules/budget/interfaces/budget.interface';
import { BudgetService } from 'src/app/modules/budget/services/budget.service';
import { BudgettransactionService } from 'src/app/modules/budgettransaction/services/budgettransaction.service';
import { UserService } from 'src/app/modules/user/services/user.service';
import { FormService } from '../../modules/form/form.service';
import { Budgetunit } from 'src/app/modules/budgetunit/interfaces/budgetunit.interface';
import { BudgetunitService } from 'src/app/modules/budgetunit/services/budgetunit.service';
import { budgettransactionFormComponents } from 'src/app/modules/budgettransaction/formcomponents/budgettransaction.formcomponents';
import { Budgettransaction } from 'src/app/modules/budgettransaction/interfaces/budgettransaction.interface';

@Component({
	selector: 'app-public',
	standalone: false,
	templateUrl: './public.component.html',
	styleUrls: ['./public.component.scss']
})
export class PublicComponent implements OnInit, OnDestroy {
	showSidebar = false;
	budgets: Budget[] = [];
	units: Budgetunit[] = [];
	selectedBudgetId: string | null = localStorage.getItem('selectedBudgetId');
	selectedUnitId: string | null = localStorage.getItem('selectedUnitId');

	ranges = ['day', 'week', 'month', 'year'];
	selectedRange: string = '';

	private _formService = inject(FormService);
	private _transactionService = inject(BudgettransactionService);
	private _budgetService = inject(BudgetService);
	private _budgetunitService = inject(BudgetunitService);
	private _platform = inject(Platform);
	public userService = inject(UserService);

	private budgetListener: any;

	async ngOnInit(): Promise<void> {
		await this.loadBudgets();

		// слухаємо вибір бюджету з футера
		this.budgetListener = (event: any) => {
			const budgetId = event.detail;
			if (budgetId) this.loadUnits(budgetId);
		};
		window.addEventListener('budgetChanged', this.budgetListener);
	}

	ngOnDestroy(): void {
		window.removeEventListener('budgetChanged', this.budgetListener);
	}

	hideSidebar(): void {
		if (!this._platform.ANDROID && !this._platform.IOS) {
			this.showSidebar = false;
		}
	}

	back(): void {
		window.history.back();
	}

	async loadBudgets(): Promise<void> {
		try {
			this.budgets = await this._budgetService.getAllBudgets();
			console.log('budgets:', this.budgets);

			if (this.selectedBudgetId) {
				await this.loadUnits(this.selectedBudgetId);
			} else if (this.budgets.length > 0) {
				this.selectedBudgetId = this.budgets[0]._id;
				await this.loadUnits(this.selectedBudgetId);
			}
		} catch (err) {
			console.error('Помилка завантаження бюджетів:', err);
		}
	}

	async onBudgetChange(budgetId: string) {
		if (!budgetId) return;

		this.selectedBudgetId = budgetId;
		localStorage.setItem('selectedBudgetId', budgetId);

		// Підвантажуємо юніти для нового бюджету
		await this.loadUnits(budgetId);

		// Повідомляємо інші компоненти
		window.dispatchEvent(
			new CustomEvent('budgetChanged', { detail: budgetId })
		);
	}

	async loadUnits(budgetId: string) {
		try {
			this.units = await firstValueFrom(
				this._budgetunitService.getUnitsByBudget(budgetId)
			);

			if (
				this.selectedUnitId &&
				this.units.some((u) => u._id === this.selectedUnitId)
			) {
				console.log(
					'Використовуємо збережений юніт:',
					this.selectedUnitId
				);
			} else {
				this.selectedUnitId =
					this.units.length > 0 ? this.units[0]._id : null;
				if (this.selectedUnitId)
					localStorage.setItem('selectedUnitId', this.selectedUnitId);
			}

			console.log('Юніти завантажені для бюджету', budgetId, this.units);
		} catch (err) {
			console.error('Помилка завантаження юнітів:', err);
		}
	}

	onUnitChange(unitId: string) {
		this.selectedUnitId = unitId;
		localStorage.setItem('selectedUnitId', unitId);

		const unit = this.units.find((u) => u._id === unitId);
		console.log('Вибраний юніт:', unit?.name);

		window.dispatchEvent(
			new CustomEvent('unitChanged', { detail: unitId })
		);
	}

	onRangeChange() {
		console.log('Вибрано період:', this.selectedRange);
	}

	getTotalCost(): number {
		return this.units.reduce(
			(sum, unit) => sum + Number(unit.cost || 0),
			0
		);
	}

	createTransaction() {
		this._formService.modal<Budgettransaction>(
			budgettransactionFormComponents,
			{
				label: 'Create',
				click: (_created: unknown, close: () => void) => {
					close(); // просто закриваємо модальне вікно після кліку
				}
			}
		);
	}

	setDocuments() {
		// Оновлення контенту сторінки після створення транзакції
	}
}
