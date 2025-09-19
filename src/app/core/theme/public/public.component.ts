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
	selectedBudgetId: string | null = null;
	selectedUnitId: string | null = null;

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
		} catch (err) {
			console.error('Помилка завантаження бюджетів:', err);
		}
	}

	async onBudgetChange(budgetId: string) {
		if (!budgetId) return;
		this.selectedBudgetId = budgetId;
		localStorage.setItem('selectedBudgetId', budgetId);
		this.selectedUnitId = null;
		this.units = [];
		await this.loadUnits(budgetId);

		window.dispatchEvent(
			new CustomEvent('budgetChanged', { detail: budgetId })
		);
	}

	async loadUnits(budgetId: string) {
		try {
			this.units = await firstValueFrom(
				this._budgetunitService.getUnitsByBudget(budgetId)
			);
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
		const selectedBudget = this.selectedBudgetId!;
		const selectedUnit = this.selectedUnitId!;
		const unitName =
			this.units.find((u) => u._id === selectedUnit)?.name || '';

		const formComponents = JSON.parse(
			JSON.stringify(budgettransactionFormComponents)
		);

		// Налаштування юніту
		const unitSelect = formComponents.components.find(
			(c: any) => c.key === 'unitId' && c.name === 'Select'
		);
		if (unitSelect) {
			const itemsField = unitSelect.fields.find(
				(f: any) => f.name === 'Items'
			);
			if (itemsField)
				itemsField.value = [{ name: unitName, value: selectedUnit }];
			const disabledField = unitSelect.fields.find(
				(f: any) => f.name === 'Disabled'
			);
			if (disabledField) disabledField.value = true;
		}

		// Налаштування бюджету
		const budgetField = formComponents.components.find(
			(c: any) => c.key === 'budget'
		);
		if (budgetField) {
			const itemsField = budgetField.fields.find(
				(f: any) => f.name === 'Items'
			);
			if (itemsField) {
				const selectedBudgetObj = this.budgets.find(
					(b) => b._id === selectedBudget
				);
				itemsField.value = selectedBudgetObj
					? [
							{
								name: selectedBudgetObj.name,
								value: selectedBudgetObj._id,
								selected: true
							}
						]
					: [];
			}
			const disabledField = budgetField.fields.find(
				(f: any) => f.name === 'Disabled'
			);
			if (disabledField) disabledField.value = true;
		}

		// Модалка з create через subscribe
		this._formService.modal<Budgettransaction>(formComponents, [
			{
				label: 'Create',
				click: (submitted: unknown, close: () => void) => {
					const created = submitted as Budgettransaction;

					// preCreate-like логіка
					created.budget = selectedBudget;
					created.units = [
						{ unit: selectedUnit, amount: created.amount }
					];
					created.isDeposit = !!created.isDeposit;

					// Виклик сервісу через subscribe
					this._transactionService
						.createTransaction(created)
						.subscribe({
							next: (res: Budgettransaction) => {
								console.log('Транзакція створена:', res);
								this.setDocuments();
								close();
							},
							error: (err: any) =>
								console.error(
									'Помилка створення транзакції:',
									err
								)
						});
				}
			}
		]);
	}

	setDocuments() {
		// Оновлення контенту сторінки після створення транзакції
	}
}
