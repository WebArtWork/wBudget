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
	columns = ['isDeposit', 'amount', 'note', 'budget', 'unitId'];
	config = this.getConfig();
	budget = this._router.url.replace('/transactions/', '');

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
	}

	async ngOnInit(): Promise<void> {
		// Завантажуємо транзакції спочатку
		await this.loadTransactions();
		// Потім юніти для Select
		await this.loadUnits();
		this.markSelectedBudget();
		// Оновлюємо таблицю
		this.setDocuments();
	}

	// ============================
	// Завантаження транзакцій з сервера
	// ============================
	async loadTransactions(): Promise<void> {
		const transactions = await firstValueFrom(
			this._budgettransactionService.getTransactionsByBudget(this.budget)
		);

		// Підтягуємо unitId, якщо його нема
		transactions.forEach((t) => {
			if (!t.unitId && t.units?.length) {
				t.unitId = t.units[0].unit;
			}
			t.isDeposit = !!t.isDeposit; // приводимо до boolean
		});

		this._budgettransactionService.budgettransactions = transactions;

		// Відмічаємо юніти у Select
		this.markSelectedUnits();
	}

	// ============================
	// Перед створенням транзакції
	// ============================
	override preCreate(doc: Budgettransaction): void {
		console.log(doc, doc.unitId);
		doc.budget = this.budget;

		// Вибір юніта
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

		// const selectedUnit = (itemsField.value as SelectItem[]).find(
		// 	(u) => u.selected
		// );
		// if (!selectedUnit) {
		// 	alert('Виберіть юніт перед створенням транзакції');
		// 	throw new Error('Unit is required');
		// }

		// doc.unitId = selectedUnit.value;

		doc.units = [{ unit: doc.unitId as string, amount: doc.amount }];

		// Встановлюємо isDeposit зі значення форми
		const isDepositField = this.form?.components
			?.find(
				(c: FormComponentInterface) =>
					c.key === 'isDeposit' && c.name === 'Boolean'
			)
			?.fields.find(
				(f: { name: string; value: any }) => f.name === 'Value'
			);

		doc.isDeposit = !!isDepositField?.value;

		console.log('doc =', doc);
	}

	// ============================
	// Після створення транзакції
	// ============================
	postCreate(doc: Budgettransaction): void {
		// Додаємо нову транзакцію в локальний масив
		this._budgettransactionService.budgettransactions.push(doc);
		// Оновлюємо таблицю
		this.setDocuments();
		// Відмічаємо юніти у Select
		this.markSelectedUnits();
	}
	// ============================
	// Завантаження юнітів у Select
	// ============================
	async loadUnits(): Promise<void> {
		const units: Budgetunit[] = budgettransactionFormComponents
			.components[3].fields[0].value as unknown as Budgetunit[];

		units.splice(0, units.length);

		this._unitService
			.getUnitsByBudget(this.budget)
			.subscribe((allUnits) => {
				units.push(...allUnits);
				console.log(allUnits);
			});
	}
	async loadBudgets(): Promise<void> {
		// Отримуємо компонент бюджету з форми
		const budgetSelect = budgettransactionFormComponents.components.find(
			(c) => c.key === 'budget' && c.name === 'Select'
		);

		if (!budgetSelect) return;

		const itemsField = budgetSelect.fields.find((f) => f.name === 'Items');
		if (!itemsField) return;

		const budgets: Budget[] = itemsField.value as unknown as Budget[];
		budgets.splice(0, budgets.length); // очищаємо старі дані

		try {
			// Підвантажуємо бюджети з сервера
			const allBudgets = await this._budgetService.getAllBudgets();
			budgets.push(...allBudgets);
			console.log('Бюджети завантажені:', allBudgets);

			// Оновлюємо форму
			this.form?.updateFields?.([budgetSelect]);
		} catch (err) {
			console.error('Помилка при завантаженні бюджетів:', err);
		}
	}

	// ============================
	// Допоміжна функція для позначення вибраних юнітів у Select
	// ============================
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

		// Підставляємо тільки поточний бюджет
		itemsField.value = [
			{
				name: this.budget, // або actual name, якщо він у Budget
				value: this.budget,
				selected: true
			}
		];

		this.form?.updateFields?.([budgetSelect]);
	}
}
