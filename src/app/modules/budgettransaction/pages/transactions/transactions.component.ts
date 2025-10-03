import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormService } from 'src/app/core/modules/form/form.service';
import { FormInterface } from 'src/app/core/modules/form/interfaces/form.interface';
import { TableModule } from 'src/app/core/modules/table/table.module';
import { TranslateService } from 'src/app/core/modules/translate/translate.service';
import { CrudComponent } from 'wacom';
import { budgettransactionFormComponents } from '../../formcomponents/budgettransaction.formcomponents';
import { Budgettransaction } from '../../interfaces/budgettransaction.interface';
import { BudgettransactionService } from '../../services/budgettransaction.service';
import { Router } from '@angular/router';
import { BudgetunitService } from 'src/app/modules/budgetunit/services/budgetunit.service';
import { FormComponentInterface } from 'src/app/core/modules/form/interfaces/component.interface';
import { firstValueFrom } from 'rxjs';
import { Budgetunit } from 'src/app/modules/budgetunit/interfaces/budgetunit.interface';
import { Budget } from 'src/app/modules/budget/interfaces/budget.interface';
import { BudgetService } from 'src/app/modules/budget/services/budget.service';

interface SelectItem {
	name: string;
	value: string;
	selected?: boolean;
}

@Component({
	imports: [CommonModule, TableModule],

	templateUrl: './transactions.component.html',
	styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent
	extends CrudComponent<
		BudgettransactionService,
		Budgettransaction,
		FormInterface
	>
	implements OnInit
{
	override configType: 'local' | 'server' = 'local';
	columns = ['isDeposit', 'amount', 'note', 'budgetName', 'unitName'];
	config = this.getConfig();
	budget = this._router.url.replace('/transactions/', '');
	private allUnits: Budgetunit[] = [];
	selectedBudget: Budget | null = null;
	override allowUrl(): boolean {
		return false;
	}

	constructor(
		private _budgettransactionService: BudgettransactionService,
		private _unitService: BudgetunitService,
		private _budgetService: BudgetService,
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

		this.config.buttons.unshift({
			icon: 'add',
			click: () => this.createTransaction()
		});

		this.config.buttons.push({
			icon: 'edit',
			click: (doc: Budgettransaction) => this.editTransaction(doc)
		});

		this.config.buttons.push({
			icon: 'delete',
			click: (doc: Budgettransaction) => this.deleteTransaction(doc)
		});
	}

	async ngOnInit(): Promise<void> {
		const budgetId = localStorage.getItem('selectedBudgetId');
		if (budgetId) {
			const budgets = await this._budgetService.getAllBudgets();
			this.selectedBudget =
				budgets.find((b: Budget) => b._id === budgetId) || null;
		}
		await this.loadBudgets();
		await this.loadUnits();
		await this.loadTransactions();
		this.markSelectedBudget();
		this.setDocuments();
	}

	async loadTransactions(): Promise<void> {
		const transactions = await firstValueFrom(
			this._budgettransactionService.getTransactionsByBudget(this.budget)
		);

		transactions.forEach((t: Budgettransaction) => {
			if (!t.unitId && t.units?.length) t.unitId = t.units[0].unit;
			t.isDeposit = !!t.isDeposit;

			const unit = this.allUnits.find(
				(u: Budgetunit) => u._id === t.unitId
			);
			t.unitName = unit ? unit.name : t.unitId;

			const budgetObj = this._budgetService.budgets?.find(
				(b: Budget) => b._id === t.budget
			);
			t.budgetName = budgetObj ? budgetObj.name : t.budget;
		});

		this._budgettransactionService.budgettransactions = transactions;
		this.documents = transactions;
		this.markSelectedUnits();
	}

	override preCreate(doc: Budgettransaction): void {
		doc.budget = this.budget;

		const selectComponent = this.form?.components?.find(
			(c: FormComponentInterface) =>
				c.key === 'unitId' && c.name === 'Select'
		);
		if (!selectComponent)
			throw new Error('Unit select component not found');

		const itemsField = selectComponent.fields.find(
			(f: { name: string; value: any }) => f.name === 'Items'
		);
		if (!itemsField) throw new Error('Unit items field not found');

		doc.units = [{ unit: doc.unitId as string, amount: doc.amount }];

		const isDepositField = this.form?.components
			?.find(
				(c: FormComponentInterface) =>
					c.key === 'isDeposit' && c.name === 'Boolean'
			)
			?.fields.find(
				(f: { name: string; value: any }) => f.name === 'Value'
			);

		doc.isDeposit = !!isDepositField?.value;
	}

	async loadUnits(): Promise<void> {
		const units: Budgetunit[] = budgettransactionFormComponents
			.components[3].fields[0].value as unknown as Budgetunit[];
		units.splice(0, units.length);

		this._unitService
			.getUnitsByBudget(this.budget)
			.subscribe((allUnits: Budgetunit[]) => {
				this.allUnits = allUnits;
				units.push(...allUnits);
				console.log('Units loaded:', allUnits);
			});
	}

	async loadBudgets(): Promise<void> {
		const budgetSelect = budgettransactionFormComponents.components.find(
			(c) => c.key === 'budget' && c.name === 'Select'
		);
		if (!budgetSelect) return;

		const itemsField = budgetSelect.fields.find((f) => f.name === 'Items');
		if (!itemsField) return;

		const budgets: Budget[] = itemsField.value as unknown as Budget[];
		budgets.splice(0, budgets.length);

		try {
			const allBudgets = await this._budgetService.getAllBudgets();
			budgets.push(...allBudgets);
			this._budgetService.budgets = allBudgets;
			console.log('Budgets loaded:', allBudgets);

			this.form?.updateFields?.([budgetSelect]);
		} catch (err) {
			console.error('Error loading budgets:', err);
		}
	}

	private markSelectedUnits(): void {
		const selectComponent = this.form?.components?.find(
			(c: FormComponentInterface) =>
				c.key === 'unitId' && c.name === 'Select'
		);
		if (!selectComponent) return;

		const itemsField = selectComponent.fields.find(
			(f: { name: string; value: any }) => f.name === 'Items'
		);
		if (!itemsField) return;

		const items = itemsField.value as SelectItem[];

		this._budgettransactionService.budgettransactions.forEach((t) => {
			const match = items.find((i) => i.value === t.unitId);
			if (match) match.selected = true;
		});

		itemsField.value = items;
		this.form?.updateFields?.([selectComponent]);
	}

	private markSelectedBudget(): void {
		const budgetSelect = this.form?.components?.find(
			(c: FormComponentInterface) =>
				c.key === 'budget' && c.name === 'Select'
		);
		if (!budgetSelect) return;

		const itemsField = budgetSelect.fields.find(
			(f: { name: string; value: any }) => f.name === 'Items'
		);
		if (!itemsField) return;

		const selectedBudgetObj = this._budgetService.budgets?.find(
			(b: Budget) => b._id === this.budget
		);

		if (selectedBudgetObj) {
			itemsField.value = [
				{
					name: selectedBudgetObj.name,
					value: selectedBudgetObj._id,
					selected: true
				}
			];
		}

		this.form?.updateFields?.([budgetSelect]);
	}

	handleButtonClick(btn: any, transaction?: Budgettransaction) {
		if (btn.click && transaction !== undefined) {
			btn.click(transaction);
		} else if (btn.click) {
			btn.click();
		}
	}

	createTransaction() {
		const formComponents = JSON.parse(
			JSON.stringify(budgettransactionFormComponents)
		);

		(this.formService as FormService).modal<Budgettransaction>(
			formComponents,
			[
				{
					label: 'Create',
					click: (submitted: unknown, close: () => void) => {
						const created = submitted as Budgettransaction;
						created.budget = this.budget;

						if (
							!created.unitId ||
							!created.amount ||
							created.amount <= 0
						) {
							alert(
								'Please select a unit and enter an amount greater than 0.'
							);
							return;
						}

						created.units = [
							{ unit: created.unitId, amount: created.amount }
						];
						created.isDeposit = !!created.isDeposit;

						const unit = this.allUnits.find(
							(u) => u._id === created.unitId
						);
						created.unitName = unit ? unit.name : created.unitId;

						const budgetObj = this._budgetService.budgets?.find(
							(b) => b._id === created.budget
						);
						created.budgetName = budgetObj
							? budgetObj.name
							: created.budget;

						this.service.create(created).subscribe({
							next: (res: Budgettransaction) => {
								this._budgettransactionService.budgettransactions =
									[
										...this._budgettransactionService
											.budgettransactions,
										res
									];
								this.documents = [...this.documents, res];
								this.setDocuments();
								this.markSelectedUnits();
								close();
							},
							error: (err) =>
								console.error(
									'Error creating transaction:',
									err
								)
						});
					}
				}
			]
		);
	}

	editTransaction(transaction: Budgettransaction) {
		const formComponents = JSON.parse(
			JSON.stringify(budgettransactionFormComponents)
		);

		(this.formService as FormService).modal<Budgettransaction>(
			formComponents,
			[
				{
					label: 'Edit',
					click: (submitted: unknown, close: () => void) => {
						const edited = submitted as Budgettransaction;
						edited._id = transaction._id;
						edited.budget = this.budget;

						if (
							!edited.unitId ||
							!edited.amount ||
							edited.amount <= 0
						) {
							alert(
								'Please select a unit and enter an amount greater than 0.'
							);
							return;
						}

						edited.units = [
							{ unit: edited.unitId, amount: edited.amount }
						];
						edited.isDeposit = !!edited.isDeposit;

						const unit = this.allUnits.find(
							(u) => u._id === edited.unitId
						);
						edited.unitName = unit ? unit.name : edited.unitId;

						const budgetObj = this._budgetService.budgets?.find(
							(b) => b._id === edited.budget
						);
						edited.budgetName = budgetObj
							? budgetObj.name
							: edited.budget;

						this.service.update(edited).subscribe({
							next: (res: Budgettransaction) => {
								this._budgettransactionService.budgettransactions =
									this._budgettransactionService.budgettransactions.map(
										(t) => (t._id === res._id ? res : t)
									);
								this.documents = this.documents.map((d) =>
									d._id === res._id ? res : d
								);

								this.setDocuments();
								this.markSelectedUnits();
								close();
							},
							error: (err) =>
								console.error('Error editing transaction:', err)
						});
					}
				}
			],
			transaction
		);
	}

	deleteTransaction(transaction: Budgettransaction) {
		if (!transaction._id) return;
		if (confirm(`Delete transaction "${transaction.note}"?`)) {
			this.service.delete(transaction).subscribe(() => {
				this.documents = this.documents.filter(
					(t) => t._id !== transaction._id
				);
				this.setDocuments();
			});
		}
	}
}
