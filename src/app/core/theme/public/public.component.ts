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
import { ViewEncapsulation } from '@angular/core';
import { ViewChild } from '@angular/core';
import { MatDateRangePicker } from '@angular/material/datepicker';
import { DateRange } from '@angular/material/datepicker';
import { FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-public',
	standalone: false,
	templateUrl: './public.component.html',
	styleUrls: ['./public.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class PublicComponent implements OnInit, OnDestroy {
	@ViewChild('picker') picker!: MatDateRangePicker<Date>;
	showSidebar = false;
	budgets: Budget[] = [];
	units: Budgetunit[] = [];
	selectedBudgetId: string | null = null;
	selectedUnitId: string | null = null;
	range = new FormGroup({
		start: new FormControl<Date | null>(null),
		end: new FormControl<Date | null>(null)
	});

	selectedBudgetName: string | null = null;
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
			const budget: Budget = event.detail;
			if (budget && budget._id !== this.selectedBudgetId) {
				this.selectedBudgetId = budget._id;
				this.selectedBudgetName = budget.name;

				this.selectedUnitId = null;
				this.units = [];
				this.loadUnits(budget._id);
			}
		};

		window.addEventListener('budgetChanged', this.budgetListener);

		const savedBudgetId = localStorage.getItem('selectedBudgetId');
		if (
			savedBudgetId &&
			this.budgets.find((b) => b._id === savedBudgetId)
		) {
			this.selectedBudgetId = savedBudgetId;
			await this.loadUnits(savedBudgetId);

			const savedUnitId = localStorage.getItem('selectedUnitId');
			if (savedUnitId && this.units.find((u) => u._id === savedUnitId)) {
				this.selectedUnitId = savedUnitId;
			}

			const selectedBudget = this.budgets.find(
				(b) => b._id === savedBudgetId
			);
			this.selectedBudgetName = selectedBudget
				? selectedBudget.name
				: null;
		}

		const savedRange = localStorage.getItem('dateRange');
		if (savedRange) {
			const parsed = JSON.parse(savedRange);
			this.range.setValue({
				start: parsed.start ? new Date(parsed.start) : null,
				end: parsed.end ? new Date(parsed.end) : null
			});
		}

		this.range.valueChanges.subscribe((val) => {
			localStorage.setItem('dateRange', JSON.stringify(val));
			window.dispatchEvent(
				new CustomEvent('dateRangeChanged', { detail: val })
			);
		});
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
			console.error('Error loading budgets:', err);
		}
	}

	async onBudgetChange(budgetId: string) {
		if (!budgetId) return;

		this.selectedBudgetId = budgetId;
		localStorage.setItem('selectedBudgetId', budgetId);

		this.selectedUnitId = null;
		localStorage.removeItem('selectedUnitId');
		this.units = [];

		await this.loadUnits(budgetId);

		const selectedBudget = this.budgets.find((b) => b._id === budgetId);
		this.selectedBudgetName = selectedBudget ? selectedBudget.name : null;
	}

	async loadUnits(budgetId: string) {
		try {
			this.units = await firstValueFrom(
				this._budgetunitService.getUnitsByBudget(budgetId)
			);
			console.log('Units loaded for budget', budgetId, this.units);
		} catch (err) {
			console.error('Error loading units:', err);
		}
	}

	onUnitChange(unitId: string) {
		this.selectedUnitId = unitId;
		localStorage.setItem('selectedUnitId', unitId);

		const unit = this.units.find((u) => u._id === unitId);
		console.log('Selected unit:', unit?.name);

		window.dispatchEvent(
			new CustomEvent('unitChanged', { detail: unitId })
		);
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

		this._formService.modal<Budgettransaction>(formComponents, [
			{
				label: 'Create',
				click: (submitted: unknown, close: () => void) => {
					const created = submitted as Budgettransaction;

					created.budget = selectedBudget;
					created.units = [
						{ unit: selectedUnit, amount: created.amount }
					];
					created.isDeposit = !!created.isDeposit;

					this._transactionService
						.createTransaction(created)
						.subscribe({
							next: (res: Budgettransaction) => {
								console.log('Transaction created:', res);
								this.setDocuments();
								close();
							},
							error: (err: any) =>
								console.error(
									'Error creating transaction:',
									err
								)
						});
				}
			}
		]);
	}

	setDocuments() {}
}
