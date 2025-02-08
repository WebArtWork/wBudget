import { Component } from '@angular/core';
import { AlertService, CoreService } from 'wacom';
import { BudgetService } from '../../services/budget.service';
import { Budget } from '../../interfaces/budget.interface';
import { FormService } from 'src/app/core/modules/form/form.service';
import { TranslateService } from 'src/app/core/modules/translate/translate.service';
import { FormInterface } from 'src/app/core/modules/form/interfaces/form.interface';
import { budgetFormComponents } from '../../formcomponents/budget.formcomponents';

@Component({
	templateUrl: './budgets.component.html',
	styleUrls: ['./budgets.component.scss'],
	standalone: false
})
export class BudgetsComponent {
	columns = ['name', 'description'];

	form: FormInterface = this._form.getForm('budget', budgetFormComponents);

	config = {
		create: (): void => {
			this._form.modal<Budget>(this.form, {
				label: 'Create',
				click: (created: unknown, close: () => void) => {
					this._preCreate(created as Budget);

					this._budgetService.create(created as Budget);

					close();
				}
			});
		},
		update: (doc: Budget): void => {
			this._form
				.modal<Budget>(this.form, [], doc)
				.then((updated: Budget) => {
					this._core.copy(updated, doc);

					this._budgetService.update(doc);
				});
		},
		delete: (doc: Budget): void => {
			this._alert.question({
				text: this._translate.translate(
					'Common.Are you sure you want to delete this budget?'
				),
				buttons: [
					{
						text: this._translate.translate('Common.No')
					},
					{
						text: this._translate.translate('Common.Yes'),
						callback: (): void => {
							this._budgetService.delete(doc);
						}
					}
				]
			});
		},
		buttons: [
			{
				icon: 'swap_vert',
				hrefFunc: (doc: Budget): string => {
					return '/transactions/' + doc._id;
				}
			},
			{
				icon: 'cloud_download',
				click: (doc: Budget): void => {
					this._form.modalUnique<Budget>('budget', 'url', doc);
				}
			}
		],
		headerButtons: [
			{
				icon: 'playlist_add',
				click: this._bulkManagement(),
				class: 'playlist'
			},
			{
				icon: 'edit_note',
				click: this._bulkManagement(false),
				class: 'edit'
			}
		]
	};

	get rows(): Budget[] {
		return this._budgetService.budgets;
	}

	constructor(
		private _budgetService: BudgetService,
		private _translate: TranslateService,
		private _alert: AlertService,
		private _form: FormService,
		private _core: CoreService
	) {}

	private _bulkManagement(create = true): () => void {
		return (): void => {
			this._form
				.modalDocs<Budget>(create ? [] : this.rows)
				.then((budgets: Budget[]) => {
					if (create) {
						for (const budget of budgets) {
							this._preCreate(budget);

							this._budgetService.create(budget);
						}
					} else {
						for (const budget of this.rows) {
							if (
								!budgets.find(
									(localBudget) =>
										localBudget._id === budget._id
								)
							) {
								this._budgetService.delete(budget);
							}
						}

						for (const budget of budgets) {
							const localBudget = this.rows.find(
								(localBudget) => localBudget._id === budget._id
							);

							if (localBudget) {
								this._core.copy(budget, localBudget);

								this._budgetService.update(localBudget);
							} else {
								this._preCreate(budget);

								this._budgetService.create(budget);
							}
						}
					}
				});
		};
	}

	private _preCreate(budget: Budget): void {
		budget.__created = false;
	}
}
