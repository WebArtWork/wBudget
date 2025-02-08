import { Component } from '@angular/core';
import { AlertService, CoreService } from 'wacom';
import { BudgettransactionService } from '../../services/budgettransaction.service';
import { Budgettransaction } from '../../interfaces/budgettransaction.interface';
import { FormService } from 'src/app/core/modules/form/form.service';
import { TranslateService } from 'src/app/core/modules/translate/translate.service';
import { FormInterface } from 'src/app/core/modules/form/interfaces/form.interface';
import { budgettransactionFormComponents } from '../../formcomponents/budgettransaction.formcomponents';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Component({
	templateUrl: './transactions.component.html',
	styleUrls: ['./transactions.component.scss'],
	standalone: false
})
export class TransactionsComponent {
	columns = ['amount', 'note'];

	form: FormInterface = this._form.getForm(
		'budgettransaction',
		budgettransactionFormComponents
	);

	budget_id = this._router.url.includes('transactions/')
		? this._router.url.replace('/transactions/', '')
		: '';

	config = {
		paginate: this.setRows.bind(this),
		perPage: 20,
		setPerPage: this._budgettransactionService.setPerPage.bind(
			this._budgettransactionService
		),
		allDocs: false,
		create: this.budget_id
			? (): void => {
					this._form.modal<Budgettransaction>(this.form, {
						label: 'Create',
						click: async (created: unknown, close: () => void) => {
							close();

							this._preCreate(created as Budgettransaction);

							await firstValueFrom(
								this._budgettransactionService.create(
									created as Budgettransaction
								)
							);

							this.setRows();
						}
					});
			  }
			: null,
		update: this.budget_id
			? (doc: Budgettransaction): void => {
					this._form
						.modal<Budgettransaction>(this.form, [], doc)
						.then((updated: Budgettransaction) => {
							this._core.copy(updated, doc);

							this._budgettransactionService.update(doc);
						});
			  }
			: null,
		delete: (doc: Budgettransaction): void => {
			this._alert.question({
				text: this._translate.translate(
					'Common.Are you sure you want to delete this budgettransaction?'
				),
				buttons: [
					{
						text: this._translate.translate('Common.No')
					},
					{
						text: this._translate.translate('Common.Yes'),
						callback: async (): Promise<void> => {
							await firstValueFrom(
								this._budgettransactionService.delete(doc)
							);

							this.setRows();
						}
					}
				]
			});
		},
		buttons: [
			this.budget_id
				? {
						icon: 'cloud_download',
						click: (doc: Budgettransaction): void => {
							this._form.modalUnique<Budgettransaction>(
								'budgettransaction',
								'url',
								doc
							);
						}
				  }
				: null
		],
		headerButtons: [
			this.budget_id
				? {
						icon: 'playlist_add',
						click: this._bulkManagement(),
						class: 'playlist'
				  }
				: null,
			this.budget_id
				? {
						icon: 'edit_note',
						click: this._bulkManagement(false),
						class: 'edit'
				  }
				: null
		]
	};

	rows: Budgettransaction[] = [];

	constructor(
		private _translate: TranslateService,
		private _budgettransactionService: BudgettransactionService,
		private _alert: AlertService,
		private _form: FormService,
		private _core: CoreService,
		private _router: Router
	) {
		this.setRows();
	}

	setRows(page = this._page): void {
		this._page = page;

		this._core.afterWhile(
			this,
			() => {
				this._budgettransactionService
					.get({
						page,
						query: this.budget_id ? 'budget=' + this.budget_id : ''
					})
					.subscribe((rows) => {
						this.rows.splice(0, this.rows.length);

						this.rows.push(...rows);
					});
			},
			250
		);
	}

	private _page = 1;

	private _bulkManagement(create = true): () => void {
		return (): void => {
			this._form
				.modalDocs<Budgettransaction>(create ? [] : this.rows)
				.then(async (budgettransactions: Budgettransaction[]) => {
					if (create) {
						for (const budgettransaction of budgettransactions) {
							this._preCreate(budgettransaction);

							await firstValueFrom(
								this._budgettransactionService.create(
									budgettransaction
								)
							);
						}
					} else {
						for (const budgettransaction of this.rows) {
							if (
								!budgettransactions.find(
									(localBudgettransaction) =>
										localBudgettransaction._id ===
										budgettransaction._id
								)
							) {
								await firstValueFrom(
									this._budgettransactionService.delete(
										budgettransaction
									)
								);
							}
						}

						for (const budgettransaction of budgettransactions) {
							const localBudgettransaction = this.rows.find(
								(localBudgettransaction) =>
									localBudgettransaction._id ===
									budgettransaction._id
							);

							if (localBudgettransaction) {
								this._core.copy(
									budgettransaction,
									localBudgettransaction
								);

								await firstValueFrom(
									this._budgettransactionService.update(
										localBudgettransaction
									)
								);
							} else {
								this._preCreate(budgettransaction);

								await firstValueFrom(
									this._budgettransactionService.create(
										budgettransaction
									)
								);
							}
						}
					}

					this.setRows();
				});
		};
	}

	private _preCreate(budgettransaction: Budgettransaction): void {
		budgettransaction.__created = false;

		budgettransaction.budget = this.budget_id;
	}
}
