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
import { Budgetunit } from 'src/app/modules/budgetunit/interfaces/budgetunit.interface';

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
	}

	ngOnInit(): void {
		console.log('ngOnInit: старт');
		// Завантажуємо юніти спочатку
		this.loadUnits()
			.then(() => {
				console.log(
					'Юніти підвантажені, зараз завантажуємо транзакції'
				);
				this.service.get({ query: 'budget=' + this.budget }).subscribe({
					next: () => this.setDocuments()
				});
			})
			.catch((err) => console.error('Помилка завантаження юнітів', err));
	}

	override preCreate(doc: Budgettransaction): void {
		delete (doc as any).__creating;
		doc.budget = this.budget;

		if (!doc.unitId) {
			console.warn('⚠️ Транзакція створюється без юніта');
		}
	}

	async loadUnits(): Promise<void> {
		console.log('loadUnits: старт, бюджет =', this.budget);
		return new Promise((resolve, reject) => {
			this._unitService.getUnitsByBudget(this.budget).subscribe({
				next: (units: Budgetunit[]) => {
					console.log('Юніти отримані з сервера:', units);

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

					console.log(
						'unitSelectConfig після заповнення:',
						this.unitSelectConfig
					);

					// Оновлюємо форму, щоб селект побачив нові Items
					this.form?.updateFields?.([this.unitSelectConfig]);
					console.log('Форма оновлена, селект має бачити юніти');

					resolve();
				},
				error: (err) => reject(err)
			});
		});
	}

	override async setDocuments(page?: number): Promise<void> {
		await super.setDocuments(page);
		console.log('setDocuments: документи завантажені', this.documents);

		const itemsField = this.unitSelectConfig.fields.find(
			(
				f
			): f is {
				name: string;
				value: { label: string; value: string }[];
			} => f.name === 'Items'
		);

		this.documents.forEach((t: any) => {
			const unit = itemsField?.value.find((u) => u.value === t.unitId);
			(t as any).unit = unit ? unit.label : '—';
		});

		console.log(
			'setDocuments: документи після прив’язки юнітів',
			this.documents
		);
	}
}
