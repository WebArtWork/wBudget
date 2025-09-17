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
		doc.budget = this.budget;

		// Вибір юніта
		const selectComponent = this.form?.components?.find(
			(c: FormComponentInterface) =>
				c.key === 'unitid' && c.name === 'Select'
		);
		if (!selectComponent)
			throw new Error('Unit select component not found');

		const itemsField = selectComponent.fields.find(
			(f: { name: string; value: any }) => f.name === 'Items'
		);
		if (!itemsField) throw new Error('Unit items field not found');

		const selectedUnit = (itemsField.value as SelectItem[]).find(
			(u) => u.selected
		);
		if (!selectedUnit) {
			alert('Виберіть юніт перед створенням транзакції');
			throw new Error('Unit is required');
		}

		doc.unitId = selectedUnit.value;
		doc.units = [{ unit: doc.unitId, amount: doc.amount }];

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
		const selectComponent = this.form?.components?.find(
			(c: FormComponentInterface) =>
				c.key === 'unitid' && c.name === 'Select'
		);
		if (!selectComponent) return;

		const units = await firstValueFrom(
			this._unitService.getUnitsByBudget(this.budget)
		);

		const newItems: SelectItem[] = units.map((u) => ({
			name: u.name,
			value: u._id,
			selected: false
		}));

		selectComponent.fields = selectComponent.fields.map(
			(f: { name: string; value: any }) =>
				f.name === 'Items' ? { ...f, value: newItems } : f
		);

		this.form?.updateFields?.([selectComponent]);

		// Відмічаємо вже вибрані юніти
		this.markSelectedUnits();
	}

	// ============================
	// Допоміжна функція для позначення вибраних юнітів у Select
	// ============================
	private markSelectedUnits(): void {
		const selectComponent = this.form?.components?.find(
			(c: FormComponentInterface) =>
				c.key === 'unitid' && c.name === 'Select'
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
}
