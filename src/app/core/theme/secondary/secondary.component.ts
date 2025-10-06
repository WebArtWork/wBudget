import { Component } from '@angular/core';
import { UserService } from 'src/app/modules/user/services/user.service';
import { Platform } from '@angular/cdk/platform';
import { Router } from '@angular/router';
import { FormService } from '../../modules/form/form.service';
import { budgettransactionFormComponents } from 'src/app/modules/budgettransaction/formcomponents/budgettransaction.formcomponents';
import { Budgettransaction } from 'src/app/modules/budgettransaction/interfaces/budgettransaction.interface';
import { BudgettransactionService } from 'src/app/modules/budgettransaction/services/budgettransaction.service';
import { BudgetunitService } from 'src/app/modules/budgetunit/services/budgetunit.service';

@Component({
	selector: 'app-secondary',
	standalone: false,
	templateUrl: './secondary.component.html',
	styleUrl: './secondary.component.scss'
})
export class SecondaryComponent {
	showSidebar = false;
	selectedBudgetName: string | null = null;
	selectedBudgetId!: string;
	selectedUnitId!: string;
	units: { _id: string; name: string }[] = [];
	budgets: { _id: string; name: string }[] = [];

	hideSidebar(): void {
		if (!this._platform.ANDROID && !this._platform.IOS) {
			this.showSidebar = false;
		}
	}

	constructor(
		public us: UserService,
		public userService: UserService,
		private _platform: Platform,
		private router: Router,
		private _formService: FormService,
		private _transactionService: BudgettransactionService,
		private _unitService: BudgetunitService
	) {}
	ngOnInit(): void {
		const savedBudgetId = localStorage.getItem('selectedBudgetId');
		const savedBudgetName = localStorage.getItem('selectedBudgetName');

		if (savedBudgetId) {
			this.selectedBudgetId = savedBudgetId;
			this.selectedBudgetName = savedBudgetName || null;

			this.loadUnits(savedBudgetId);
		}
	}

	async loadUnits(budgetId: string) {
		try {
			const units = await this._unitService
				.getUnitsByBudget(budgetId)
				.toPromise();
			if (units) {
				this.units = units;
			} else {
				this.units = [];
			}
		} catch (err) {
			console.error('Error loading units:', err);
			this.units = [];
		}
	}

	back(): void {
		window.history.back();
	}
	goToBudgetOrDashboard(): void {
		if (this.router.url === '/budgets') {
			this.router.navigate(['/dashboard']);
		} else {
			this.router.navigate(['/budgets']);
		}
		this.hideSidebar();
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

			if (itemsField) {
				itemsField.value = this.units;
			}
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
						{ unit: created.unitId!, amount: created.amount }
					];

					created.isDeposit = !!created.isDeposit;

					this._transactionService
						.createTransaction(created)
						.subscribe({
							next: (res: Budgettransaction) => {
								console.log('Transaction created:', res);
								this.setDocuments();
								close();
								window.dispatchEvent(
									new CustomEvent('transactionCreated', {
										detail: res
									})
								);
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
