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
	units: (Budgetunit & { totalAmount?: number })[] = [];

	selectedBudget: string | null = null;
	selectedUnit: string | null = null;

	transactions: Budgettransaction[] = [];

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
			const budgetId = event.detail;
			if (budgetId) {
				this.selectedBudget = budgetId;
				this.selectedUnit = null;

				// Підвантажуємо юніти
				this.units = await firstValueFrom(
					this._budgetunitService.getUnitsByBudget(budgetId)
				);

				// Підвантажуємо всі транзакції для бюджету
				this._budgettransactionService
					.getTransactionsByBudget(budgetId)
					.subscribe((transactions) => {
						this.transactions = transactions.map((t: any) => {
							if (!t.unitId && t.units?.length) {
								t.unitId = t.units[0]?.unit || null;
							}
							return {
								...t,
								unitId: t.unitId ? String(t.unitId) : null,
								isDeposit: !!t.isDeposit,
								amount: Number(t.amount) || 0
							};
						});

						// Обчислюємо суму транзакцій для кожного юніта
						this.units = this.units.map((u) => ({
							...u,
							totalAmount: this.transactions
								.filter(
									(t) => String(t.unitId) === String(u._id)
								)
								.reduce(
									(sum, t) =>
										sum +
										(t.isDeposit ? t.amount : -t.amount),
									0
								)
						}));
					});
			} else {
				this.units = [];
				this.transactions = [];
				this.selectedBudget = null;
				this.selectedUnit = null;
			}
		};
		window.addEventListener('budgetChanged', this.budgetListener);

		// Слухаємо зміну юніта
		this.unitListener = (event: any) => {
			const unitId = event.detail;
			this.selectedUnit = unitId || null;
			// Відображати транзакції тільки для вибраного юніта
		};
		window.addEventListener('unitChanged', this.unitListener);
	}

	ngOnDestroy() {
		window.removeEventListener('budgetChanged', this.budgetListener);
		window.removeEventListener('unitChanged', this.unitListener);
	}

	selectUnit(unitId: string) {
		this.selectedUnit = unitId;
		window.dispatchEvent(
			new CustomEvent('unitChanged', { detail: unitId })
		);
	}

	get filteredTransactions(): Budgettransaction[] {
		if (!this.selectedUnit) return [];
		return this.transactions.filter(
			(t) => String(t.unitId) === String(this.selectedUnit)
		);
	}

	getTotalAmount(): number {
		if (this.selectedUnit) {
			return this.filteredTransactions.reduce(
				(sum, t) => sum + (t.isDeposit ? t.amount : -t.amount),
				0
			);
		} else {
			return this.units.reduce((sum, u) => sum + (u.totalAmount || 0), 0);
		}
	}

	getIncomeTotal(): number {
		if (this.selectedUnit) {
			return this.filteredTransactions
				.filter((t) => t.isDeposit)
				.reduce((sum, t) => sum + t.amount, 0);
		} else {
			return this.units.reduce((sum, u) => sum + (u.totalAmount || 0), 0);
		}
	}

	getExpenseTotal(): number {
		if (this.selectedUnit) {
			return this.filteredTransactions
				.filter((t) => !t.isDeposit)
				.reduce((sum, t) => sum + t.amount, 0);
		} else {
			return 0;
		}
	}

	getCategoriesData() {
		const categories: { [key: string]: number } = {};

		if (this.selectedUnit) {
			this.filteredTransactions.forEach((t) => {
				const category = t.note || 'Other';
				categories[category] = (categories[category] || 0) + t.amount;
			});
		} else {
			this.units.forEach((u) => {
				categories[u.name] = u.totalAmount || 0;
			});
		}

		const total = Object.values(categories).reduce(
			(sum, val) => sum + val,
			0
		);
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

		const gradients = Object.entries(categories).map(([_, value], i) => {
			const percent = (value / total) * 100;
			const end = start + percent;
			const color = colors[i % colors.length];
			const g = `${color} ${start}% ${end}%`;
			start = end;
			return g;
		});

		return { background: `conic-gradient(${gradients.join(', ')})` };
	}

	getColorForTransaction(transaction: { note?: string }) {
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
		const index = Object.keys(categories).indexOf(
			transaction.note || 'Other'
		);
		return colors[index % colors.length];
	}
}
