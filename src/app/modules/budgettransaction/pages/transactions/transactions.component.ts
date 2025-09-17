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

	columns = ['isDeposit', 'amount', 'note', 'budget', 'unit'];
	config = this.getConfig();
	budget = this._router.url.replace('/transactions/', '');

	constructor(
		_budgettransactionService: BudgettransactionService,
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

	ngOnInit(): void {
		this.loadUnits().then(() => this.setDocuments());
	}

	// ============================
	// Формуємо units перед створенням транзакції
	// ============================
	override preCreate(doc: Budgettransaction): void {
		doc.budget = this.budget;

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

		// Формуємо масив units
		doc.units = [
			{
				unit: selectedUnit.value,
				amount: Number(doc.amount)
			}
		];

		// Локальне поле для відображення в таблиці
		(doc as any)._unitName = selectedUnit.name;
	}

	// ============================
	// Завантажуємо юніти у Select
	// ============================
	async loadUnits(): Promise<void> {
		try {
			const units = await firstValueFrom(
				this._unitService.getUnitsByBudget(this.budget)
			);

			const selectComponent = this.form?.components?.find(
				(c: FormComponentInterface) =>
					c.key === 'unitid' && c.name === 'Select'
			);
			if (!selectComponent) return;

			// itemsField з типом
			const itemsField = selectComponent.fields.find(
				(f: { name: string; value: any }) => f.name === 'Items'
			);
			const currentSelected = (itemsField?.value as SelectItem[])?.find(
				(u) => u.selected
			)?.value;

			const newItems: SelectItem[] = units.map((u) => ({
				name: u.name,
				value: u._id,
				selected: u._id === currentSelected
			}));

			selectComponent.fields = selectComponent.fields.map(
				(f: { name: string; value: any }) =>
					f.name === 'Items' ? { ...f, value: newItems } : f
			);

			this.form?.updateFields?.([selectComponent]);
		} catch (err) {
			console.error('Помилка завантаження юнітів:', err);
		}
	}

	// ============================
	// Відображаємо юніти у таблиці
	// ============================
	override async setDocuments(page?: number): Promise<void> {
		await super.setDocuments(page);

		const selectComponent = this.form?.components?.find(
			(c: FormComponentInterface) =>
				c.key === 'unitid' && c.name === 'Select'
		);
		if (!selectComponent) return;

		const itemsField = selectComponent.fields.find(
			(f: any): f is { name: string; value: SelectItem[] } =>
				f.name === 'Items'
		);
		if (!itemsField) return;

		this.documents.forEach((t) => {
			const unitId = t.units?.[0]?.unit || null;
			if (!unitId) {
				(t as any)._unitName = '—';
				return;
			}

			const unit = (itemsField.value as SelectItem[]).find(
				(u) => u.value?.toString() === unitId?.toString()
			);
			(t as any)._unitName = unit?.name || '—';
		});
	}
}
