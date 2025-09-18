import { Component, OnInit, OnDestroy } from '@angular/core';
import { BudgetunitService } from 'src/app/modules/budgetunit/services/budgetunit.service';
import { UserService } from 'src/app/modules/user/services/user.service';
import { BudgettransactionService } from 'src/app/modules/budgettransaction/services/budgettransaction.service';
import { firstValueFrom } from 'rxjs';
import { Budgetunit } from 'src/app/modules/budgetunit/interfaces/budgetunit.interface';
import { Budgettransaction } from 'src/app/modules/budgettransaction/interfaces/budgettransaction.interface';

@Component({
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss'],
	standalone: false
})
export class DashboardComponent implements OnInit, OnDestroy {
	isMenuOpen = false;
	units: Budgetunit[] = [];

	selectedBudget: string | null = null;
	selectedUnit: string | null = null;
	selectedRange: 'day' | 'week' | 'month' | 'year' = 'day';

	transactions: {
		isDeposit: boolean;
		amount: number;
		note?: string;
		unitId?: string;
	}[] = [];

	private budgetListener: any;
	private unitListener: any;

	constructor(
		public userService: UserService,
		private _budgetunitService: BudgetunitService,
		private _budgettransactionService: BudgettransactionService
	) {}

	ngOnInit() {
		// Слухаємо зміну бюджету
		this.budgetListener = async (event: any) => {
			console.log('budgetChanged event received:', event.detail);
			const budgetId = event.detail;
			if (budgetId) {
				this.selectedBudget = budgetId;
				this.selectedUnit = null;
				this.transactions = [];

				// Підвантажуємо юніти
				this.units = await firstValueFrom(
					this._budgetunitService.getUnitsByBudget(budgetId)
				);
				console.log('Units loaded:', this.units);
			} else {
				this.units = [];
				this.transactions = [];
				this.selectedBudget = null;
				this.selectedUnit = null;
			}
			this.logTransactionsState();
		};
		window.addEventListener('budgetChanged', this.budgetListener);

		// Слухаємо зміну юніта
		this.unitListener = (event: any) => {
			const unitId = event.detail;
			console.log('unitChanged event received:', unitId);
			if (unitId) {
				this.selectedUnit = unitId;
				this._budgettransactionService
					.getTransactionsByUnit(unitId)
					.subscribe((transactions) => {
						console.log(
							'Transactions for unit',
							unitId,
							transactions
						);

						if (!transactions || !Array.isArray(transactions)) {
							console.warn(
								'Transactions пусті або неправильний формат, підставляю тестові дані'
							);
							this.transactions = [
								{
									isDeposit: true,
									amount: 100,
									note: 'Test deposit',
									unitId
								},
								{
									isDeposit: false,
									amount: 50,
									note: 'Test expense',
									unitId
								}
							];
						} else {
							this.transactions = transactions.map((t: any) => ({
								isDeposit: !!t.isDeposit,
								amount: Number(t.amount) || 0,
								note: t.note,
								unitId: t.unitId
							}));
						}
						this.logTransactionsState();
					});
			} else {
				this.transactions = [];
				this.selectedUnit = null;
			}
		};
		window.addEventListener('unitChanged', this.unitListener);
	}

	ngOnDestroy() {
		window.removeEventListener('budgetChanged', this.budgetListener);
		window.removeEventListener('unitChanged', this.unitListener);
	}

	back(): void {
		window.history.back();
	}

	loadTransactions(budgetId: string) {
		this._budgettransactionService
			.getTransactionsByBudget(budgetId)
			.subscribe((transactions) => {
				console.log('Transactions for budget', budgetId, transactions);
				if (!transactions || !Array.isArray(transactions)) {
					console.warn('Transactions пусті для бюджету', budgetId);
					this.transactions = [];
				} else {
					this.transactions = transactions.map((t: any) => ({
						isDeposit: !!t.isDeposit,
						amount: Number(t.amount) || 0,
						note: t.note,
						unitId: t.unitId
					}));
				}
				this.logTransactionsState();
			});
	}

	loadTransactionsByUnit(unitId: string) {
		this._budgettransactionService
			.getTransactionsByUnit(unitId)
			.subscribe((transactions) => {
				console.log('Transactions by unit', unitId, transactions);
				if (!transactions || !Array.isArray(transactions)) {
					console.warn('Transactions пусті для юніта', unitId);
					this.transactions = [];
				} else {
					this.transactions = transactions.map((t: any) => ({
						isDeposit: !!t.isDeposit,
						amount: Number(t.amount) || 0,
						note: t.note,
						unitId: t.unitId
					}));
				}
				this.logTransactionsState();
			});
	}

	onRangeChange(range: 'day' | 'week' | 'month' | 'year') {
		this.selectedRange = range;
		console.log('Selected range:', this.selectedRange);
	}

	getTotalAmount(): number {
		const total = this.transactions.reduce(
			(sum, t) => sum + (t.isDeposit ? t.amount : -t.amount),
			0
		);
		console.log('Total amount calculated:', total);
		return total;
	}

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
		console.log('Categories data:', categories, 'Total:', total);
		return { categories, total };
	}

	get circleChartStyle() {
		const { categories, total } = this.getCategoriesData();
		if (total === 0) return { background: '#ccc' };

		let start = 0;
		const colors = [
			'#005F73',
			'#0A9396',
			'#94D2BD',
			'#E9D8A6',
			'#EE9B00',
			'#CA6702',
			'#BB3E03',
			'#AE2012',
			'#023E58',
			'#127475',
			'#7FB3A5',
			'#DAD7A7',
			'#F4A300',
			'#D15600',
			'#A63200'
		];
		const gradients = Object.entries(categories).map(([key, value], i) => {
			const percent = (value / total) * 100;
			const end = start + percent;
			const color = colors[i % colors.length];
			const g = `${color} ${start}% ${end}%`;
			start = end;
			return g;
		});

		return { background: `conic-gradient(${gradients.join(', ')})` };
	}

	getLegend() {
		const { categories } = this.getCategoriesData();
		const colors = [
			'#005F73',
			'#0A9396',
			'#94D2BD',
			'#E9D8A6',
			'#EE9B00',
			'#CA6702',
			'#BB3E03',
			'#AE2012',
			'#023E58',
			'#127475',
			'#7FB3A5',
			'#DAD7A7',
			'#F4A300',
			'#D15600',
			'#A63200'
		];
		return Object.entries(categories).map(([name, amount], i) => ({
			name,
			amount,
			color: colors[i % colors.length]
		}));
	}

	getColorForTransaction(transaction: { note?: string }) {
		const legend = this.getLegend();
		const item = legend.find(
			(l) => l.name === (transaction.note || 'Other')
		);
		return item ? item.color : '#999';
	}

	selectUnit(unitId: string) {
		this.selectedUnit = unitId;
		window.dispatchEvent(
			new CustomEvent('unitChanged', { detail: unitId })
		);
	}

	getIncomeTotal(): number {
		const total = this.transactions
			.filter((t) => t.isDeposit)
			.reduce((sum, t) => sum + t.amount, 0);
		console.log('Income total:', total);
		return total;
	}

	getExpenseTotal(): number {
		const total = this.transactions
			.filter((t) => !t.isDeposit)
			.reduce((sum, t) => sum + t.amount, 0);
		console.log('Expense total:', total);
		return total;
	}

	private logTransactionsState() {
		console.log('Current transactions:', this.transactions);
		console.log('Categories:', this.getCategoriesData());
		console.log('Total amount:', this.getTotalAmount());
		console.log('Income total:', this.getIncomeTotal());
		console.log('Expense total:', this.getExpenseTotal());
	}
}
