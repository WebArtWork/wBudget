import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormService } from 'src/app/core/modules/form/form.service';
import { FormInterface } from 'src/app/core/modules/form/interfaces/form.interface';
import { TableModule } from 'src/app/core/modules/table/table.module';
import { TranslateService } from 'src/app/core/modules/translate/translate.service';
import { CrudComponent } from 'wacom';
import { budgettransactionFormComponents } from '../../formcomponents/budgettransaction.formcomponents';
import { Budgettransaction } from '../../interfaces/budgettransaction.interface';
import { BudgettransactionService } from '../../services/budgettransaction.service';
import { BudgetService } from 'src/app/modules/budget/services/budget.service';
import { Router } from '@angular/router';
import { BudgetunitService } from 'src/app/modules/budgetunit/services/budgetunit.service';
import { Budgetunit } from 'src/app/modules/budgetunit/interfaces/budgetunit.interface';

@Component({
	imports: [CommonModule, TableModule],
	templateUrl: './transactions.component.html',
	styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent extends CrudComponent<
	BudgettransactionService,
	Budgettransaction,
	FormInterface
> {
	override configType: 'local' | 'server' = 'local';

	columns = ['isDeposit', 'amount', 'note', 'budget'];

	config = this.getConfig();

	budget = this._router.url.replace('/transactions/', '');

	unitSelectConfig = {
		name: 'Select',
		key: 'unitId',
		fields: [
			{ name: 'Items', value: [] as { label: string; value: string }[] },
			{ name: 'Placeholder', value: 'Select unit' },
			{ name: 'Label', value: 'Unit' }
		]
	};

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

		_budgettransactionService
			.get({ query: 'budget=' + this.budget })
			.subscribe({
				next: () => this.setDocuments()
			});
	}
	ngOnInit(): void {
		this.loadUnits();
	}

	override preCreate(doc: Budgettransaction): void {
		delete (doc as any).__creating;
		doc.budget = this.budget;
	}

	loadUnits(): void {
		this._unitService.getUnitsByBudget(this.budget).subscribe({
			next: (res: any) => {
				// тут res - об'єкт з docs
				const units: Budgetunit[] = res.docs ?? [];

				const itemsField = this.unitSelectConfig.fields.find(
					(
						f
					): f is {
						name: string;
						value: { label: string; value: string }[];
					} => f.name === 'Items'
				);

				if (itemsField) {
					itemsField.value = units.map((u) => ({
						label: u.name,
						value: u._id
					}));
				}
			},
			error: (err) => console.error('Не вдалося завантажити юніти', err)
		});
	}
}
