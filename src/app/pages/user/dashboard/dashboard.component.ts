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

	/** ------------------- Додано для динамічної кругової діаграми ------------------- */

	// Підрахунок сум по категоріях
	getCategoriesData() {
		const categories: { [key: string]: number } = {};
		this.transactions.forEach((t) => {
			const category = t.note || 'Other';
			categories[category] = (categories[category] || 0) + t.amount;
		});
		const total = Object.values(categories).reduce(
			(sum, val) => sum + val,
			0
		);
		return { categories, total };
	}

	// Стиль для кругової діаграми
	get circleChartStyle() {
		const { categories, total } = this.getCategoriesData();
		if (total === 0) return { background: '#ccc' }; // якщо даних нема

		let start = 0;
		const colors = [
			'#003049',
			'#6B2C39',
			'#D62828',
			'#F77F00',
			'#FCBF49',
			'#EAE2B7',
			'#8E3B46',
			'#FF5C00',
			'#F2D16B',
			'#001F3F',
			'#264653',
			'#6A4C93'
		];
		const gradients = Object.entries(categories).map(([key, value], i) => {
			const percent = (value / total) * 100;
			const end = start + percent;
			const color = colors[i % colors.length];
			const g = `${color} ${start}% ${end}%`;
			start = end;
			return g;
		});

		return {
			background: `conic-gradient(${gradients.join(', ')})`
		};
	}

	// Генеруємо легенду для категорій
	getLegend() {
		const { categories } = this.getCategoriesData();
		const colors = [
			'#003049',
			'#6B2C39',
			'#D62828',
			'#F77F00',
			'#FCBF49',
			'#EAE2B7',
			'#8E3B46',
			'#FF5C00',
			'#F2D16B',
			'#001F3F',
			'#264653',
			'#6A4C93'
		];
		return Object.entries(categories).map(([name, amount], i) => ({
			name,
			amount,
			color: colors[i % colors.length]
		}));
	}

	// Колір для конкретної транзакції
	getColorForTransaction(transaction: { note?: string }) {
		const legend = this.getLegend();
		const item = legend.find(
			(l) => l.name === (transaction.note || 'Other')
		);
		return item ? item.color : '#999';
	}
	// Підрахунок доходів
	getIncomeTotal(): number {
		return this.transactions
			.filter((t) => t.isDeposit)
			.reduce((sum, t) => sum + t.amount, 0);
	}

	// Підрахунок витрат
	getExpenseTotal(): number {
		return this.transactions
			.filter((t) => !t.isDeposit)
			.reduce((sum, t) => sum + t.amount, 0);
	}
}
