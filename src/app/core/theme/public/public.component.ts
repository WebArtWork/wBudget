import { Platform } from '@angular/cdk/platform';
import { Component, inject, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { budgettransactionFormComponents } from 'src/app/modules/budgettransaction/formcomponents/budgettransaction.formcomponents';
import { Budgettransaction } from 'src/app/modules/budgettransaction/interfaces/budgettransaction.interface';
import { BudgettransactionService } from 'src/app/modules/budgettransaction/services/budgettransaction.service';
import { UserService } from 'src/app/modules/user/services/user.service';
import { FormService } from '../../modules/form/form.service';
import { BudgetService } from 'src/app/modules/budget/services/budget.service';
import { Budget } from 'src/app/modules/budget/interfaces/budget.interface';

@Component({
	selector: 'app-public',
	standalone: false,
	templateUrl: './public.component.html',
	styleUrl: './public.component.scss'
})
export class PublicComponent implements OnInit {
	showSidebar = false;
	budgets: Budget[] = [];
	selectedBudgetId: string = '';

	isMenuOpen = false;
	units = ['Їжа', 'Транспорт', 'Житло', 'Розваги'];
	ranges = ['day', 'week', 'month', 'year'];

	isDropdownOpen = false;
	isUnitDropdownOpen = false;
	isRangeDropdownOpen = false;

	selectedRange: string = '';
	selectedBudget: string = '';
	selectedUnit: string = '';
	selectedUnits: string[] = [];

	private _formService = inject(FormService);
	private _transactionService = inject(BudgettransactionService);
	private _budgetService = inject(BudgetService);
	private _platform = inject(Platform);
	public userService = inject(UserService);

	ngOnInit(): void {
		this.loadBudgets(); // підвантажуємо бюджети при ініціалізації
	}

	// ----------------- Sidebar -----------------
	hideSidebar(): void {
		if (!this._platform.ANDROID && !this._platform.IOS) {
			this.showSidebar = false;
		}
	}

	back(): void {
		window.history.back();
	}

	// ----------------- Select Handlers -----------------
	async loadBudgets() {
		this.budgets = await this._budgetService.getAllBudgets(); // отримуємо всі бюджети
	}

	onBudgetChange() {
		const budget = this.budgets.find(
			(b) => b._id === this.selectedBudgetId
		);
		console.log('Вибраний бюджет:', budget?.name);
	}

	onUnitChange() {
		console.log('Вибрані юніти:', this.selectedUnits);
	}

	onRangeChange() {
		console.log('Вибрано період:', this.selectedRange);
	}

	// ----------------- Transactions -----------------
	createTransaction() {
		this._formService.modal<Document>(budgettransactionFormComponents, {
			label: 'Create',
			click: async (created: unknown, close: () => void) => {
				close();

				await firstValueFrom(
					this._transactionService.create(
						created as Budgettransaction
					)
				);

				this.setDocuments();
			}
		});
	}

	setDocuments() {
		// update content of this page
	}
}
