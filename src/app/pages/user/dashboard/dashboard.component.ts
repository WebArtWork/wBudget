import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { BudgetunitService } from 'src/app/modules/budgetunit/services/budgetunit.service';
import { UserService } from 'src/app/modules/user/services/user.service';
import { BudgettransactionService } from 'src/app/modules/budgettransaction/services/budgettransaction.service';
@Component({
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss'],
	standalone: false
})
export class DashboardComponent implements OnInit, OnDestroy {
	isMenuOpen = false;

	selectedBudget: string = localStorage.getItem('selectedBudgetId') || '';
	selectedRange: 'day' | 'week' | 'month' | 'year' = 'day';

	transactions: { isDeposit: boolean; amount: number; note?: string }[] = [];
	private budgetListener: any;

	constructor(
		public userService: UserService,
		private _budgetunitService: BudgetunitService,
		private _budgettransactionService: BudgettransactionService
	) {}

	ngOnInit() {
		if (this.selectedBudget) {
			this.loadTransactions(this.selectedBudget);
		}

		this.budgetListener = (event: any) => {
			const budgetId = event.detail;
			if (budgetId) {
				this.selectedBudget = budgetId;
				localStorage.setItem('selectedBudgetId', budgetId);
				this.loadTransactions(budgetId);
			}
		};
		window.addEventListener('budgetChanged', this.budgetListener);
	}

	ngOnDestroy() {
		window.removeEventListener('budgetChanged', this.budgetListener);
	}

	back(): void {
		window.history.back();
	}

	loadTransactions(budgetId: string) {
		this._budgettransactionService
			.getTransactionsByBudget(budgetId)
			.subscribe((transactions) => {
				console.log('Транзакції для бюджету', budgetId, transactions);
				this.transactions = transactions.map((t: any) => ({
					isDeposit: t.isDeposit,
					amount: Number(t.amount) || 0,
					note: t.note
				}));
			});
	}

	onRangeChange(range: 'day' | 'week' | 'month' | 'year') {
		this.selectedRange = range;
		console.log('Вибраний період:', this.selectedRange);
	}

	getTotalAmount(): number {
		return this.transactions.reduce(
			(sum, t) => sum + (t.isDeposit ? t.amount : -t.amount),
			0
		);
	}
}
