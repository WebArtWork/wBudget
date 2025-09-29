import { Component, OnInit, OnDestroy } from '@angular/core';
import { BudgetunitService } from 'src/app/modules/budgetunit/services/budgetunit.service';
import { UserService } from 'src/app/modules/user/services/user.service';
import { BudgettransactionService } from 'src/app/modules/budgettransaction/services/budgettransaction.service';
import { firstValueFrom } from 'rxjs';
import { Budgetunit } from 'src/app/modules/budgetunit/interfaces/budgetunit.interface';
import { Budgettransaction } from 'src/app/modules/budgettransaction/interfaces/budgettransaction.interface';
import { ActivatedRoute } from '@angular/router';
import { BudgetService } from 'src/app/modules/budget/services/budget.service';
import { Budget } from 'src/app/modules/budget/interfaces/budget.interface';

@Component({
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss'],
	standalone: false
})
export class DashboardComponent implements OnInit, OnDestroy {
	isMenuOpen = false;
	units: (Budgetunit & { totalAmount?: number })[] = [];

	budgets: Budget[] = [];
	selectedBudgetId: string | null = null;
	selectedUnitId: string | null = null;

	selectedBudget: string | null = null;
	selectedUnit: string | null = null;

	transactions: Budgettransaction[] = [];
	selectedRange: { start: Date | null; end: Date | null } = {
		start: null,
		end: null
	};

	private budgetListener: any;
	private unitListener: any;
	private dateRangeListener: any;
	constructor(
		public userService: UserService,
		private _budgetunitService: BudgetunitService,
		private _budgettransactionService: BudgettransactionService,
		private budgetService: BudgetService,
		private route: ActivatedRoute
	) {}

	async ngOnInit() {
		this.budgets = await this.budgetService.getAllBudgets();

		const budgetId = this.route.snapshot.queryParamMap.get('budget');
		let budget: Budget | undefined;

		if (budgetId) {
			budget = this.budgets.find((b) => b._id === budgetId);
		} else if (this.budgets.length > 0) {
			budget = this.budgets[0];
		}

		if (budget) {
			await this.loadBudgetData(budget);

			window.dispatchEvent(
				new CustomEvent('budgetChanged', { detail: budget })
			);
		}

		this.route.queryParams.subscribe(async (params) => {
			const newBudgetId = params['budget'];
			if (!newBudgetId || newBudgetId === budget?._id) return;

			const newBudget = this.budgets.find((b) => b._id === newBudgetId);
			if (newBudget) {
				await this.loadBudgetData(newBudget);
				window.dispatchEvent(
					new CustomEvent('budgetChanged', { detail: newBudget })
				);
			}
		});

		this.budgetListener = async (event: any) => {
			const budget: Budget = event.detail;
			if (!budget?._id) return;

			this.selectedBudget = budget._id;

			// Підтягуємо юніти та транзакції
			this.units = await firstValueFrom(
				this._budgetunitService.getUnitsByBudget(budget._id)
			);
			this.transactions = await firstValueFrom(
				this._budgettransactionService.getTransactionsByBudget(
					budget._id
				)
			);

			// Рахуємо totalAmount для кожного юніта
			this.units = this.units.map((u) => {
				const totalAmount = this.transactions.reduce((sum, t) => {
					if (!this.isTransactionInRange(t)) return sum;

					if (t.unitId && String(t.unitId) === String(u._id)) {
						return sum + (t.isDeposit ? t.amount : -t.amount);
					}

					if (t.units) {
						const entry = t.units.find(
							(x) => String(x.unit) === String(u._id)
						);
						if (entry)
							return (
								sum +
								(t.isDeposit ? entry.amount : -entry.amount)
							);
					}

					return sum;
				}, 0);
				return { ...u, totalAmount };
			});

			// НЕ обираємо юніт автоматично
			this.selectedUnit = null;
			this.selectedUnitId = null;
		};

		window.addEventListener('budgetChanged', this.budgetListener);

		this.unitListener = (event: any) => {
			const unitId = event.detail;
			this.selectedUnit = unitId || null;
		};
		window.addEventListener('unitChanged', this.unitListener);

		this.dateRangeListener = (event: any) => {
			this.selectedRange = {
				start: event.detail.start ? new Date(event.detail.start) : null,
				end: event.detail.end ? new Date(event.detail.end) : null
			};
		};
		window.addEventListener('dateRangeChanged', this.dateRangeListener);

		const saved = localStorage.getItem('dateRange');
		if (saved) {
			const parsed = JSON.parse(saved);
			this.selectedRange = {
				start: parsed.start ? new Date(parsed.start) : null,
				end: parsed.end ? new Date(parsed.end) : null
			};
		}
	}

	private async loadBudgetData(budget: Budget) {
		// Встановлюємо обраний бюджет
		this.selectedBudget = budget._id;

		// Не скидаємо selectedUnit — користувач обирає сам
		// this.selectedUnit = null;

		// Підтягуємо юніти
		this.units = await firstValueFrom(
			this._budgetunitService.getUnitsByBudget(budget._id)
		);

		// Підтягуємо транзакції
		this.transactions = await firstValueFrom(
			this._budgettransactionService.getTransactionsByBudget(budget._id)
		);

		// Рахуємо totalAmount для кожного юніта (для графіка)
		this.units = this.units.map((u) => {
			const totalAmount = this.transactions.reduce((sum, t) => {
				if (!this.isTransactionInRange(t)) return sum;

				if (t.unitId && String(t.unitId) === String(u._id)) {
					return sum + (t.isDeposit ? t.amount : -t.amount);
				}

				if (t.units) {
					const entry = t.units.find(
						(x) => String(x.unit) === String(u._id)
					);
					if (entry)
						return (
							sum + (t.isDeposit ? entry.amount : -entry.amount)
						);
				}

				return sum;
			}, 0);

			return { ...u, totalAmount };
		});
	}

	onUnitChange(unitId: string | null) {
		this.selectedUnitId = unitId;
		this.selectedUnit = unitId;
		window.dispatchEvent(
			new CustomEvent('unitChanged', { detail: unitId })
		);
	}
	ngOnDestroy() {
		window.removeEventListener('budgetChanged', this.budgetListener);
		window.removeEventListener('unitChanged', this.unitListener);
		if (this.dateRangeListener) {
			window.removeEventListener(
				'dateRangeChanged',
				this.dateRangeListener
			);
		}
	}

	selectUnit(unitId: string | null) {
		this.selectedUnit = unitId;
		this.selectedUnitId = unitId;
		window.dispatchEvent(
			new CustomEvent('unitChanged', { detail: unitId })
		);
	}

	private getEndOfDay(date: Date): Date {
		const endDate = new Date(date);
		endDate.setHours(23, 59, 59, 999);
		return endDate;
	}

	get filteredTransactions(): Budgettransaction[] {
		if (!this.selectedUnit) return [];

		return this.transactions.filter((t) => {
			const matchesUnit =
				(t.unitId && String(t.unitId) === String(this.selectedUnit)) ||
				(t.units &&
					t.units.some(
						(u) => String(u.unit) === String(this.selectedUnit)
					));

			if (!matchesUnit) return false;

			if (this.selectedRange.start && this.selectedRange.end && t._id) {
				const timestamp = parseInt(t._id.substring(0, 8), 16) * 1000;
				const txDate = new Date(timestamp);
				const endDate = this.getEndOfDay(this.selectedRange.end);
				return txDate >= this.selectedRange.start && txDate <= endDate;
			}

			return true;
		});
	}

	private isTransactionInRange(t: Budgettransaction): boolean {
		if (this.selectedRange.start && this.selectedRange.end && t._id) {
			const timestamp = parseInt(t._id.substring(0, 8), 16) * 1000;
			const txDate = new Date(timestamp);
			const endDate = this.getEndOfDay(this.selectedRange.end);
			return txDate >= this.selectedRange.start! && txDate <= endDate;
		}
		return true;
	}

	getFilteredUnits(): (Budgetunit & { totalAmount: number })[] {
		return this.units.map((u) => {
			let txs = this.transactions.filter(
				(t) =>
					String(t.unitId) === String(u._id) ||
					(t.units &&
						t.units.some((x) => String(x.unit) === String(u._id)))
			);

			if (this.selectedRange.start && this.selectedRange.end) {
				const start = this.selectedRange.start;
				const end = this.getEndOfDay(this.selectedRange.end);
				txs = txs.filter((t) => {
					const timestamp =
						parseInt(t._id.substring(0, 8), 16) * 1000;
					const txDate = new Date(timestamp);
					return txDate >= start && txDate <= end;
				});
			}

			const totalAmount = txs.reduce((sum, t) => {
				if (t.unitId && String(t.unitId) === String(u._id))
					return sum + (t.isDeposit ? t.amount : -t.amount);
				if (t.units) {
					const entry = t.units.find(
						(x) => String(x.unit) === String(u._id)
					);
					if (entry)
						return (
							sum + (t.isDeposit ? entry.amount : -entry.amount)
						);
				}
				return sum;
			}, 0);

			return { ...u, totalAmount };
		});
	}

	getIncomeTotal(): number {
		const endDate = this.selectedRange.end
			? this.getEndOfDay(this.selectedRange.end)
			: null;

		if (this.selectedUnit) {
			return this.filteredTransactions
				.filter((t) => t.isDeposit)
				.reduce((sum, t) => {
					if (
						t.unitId &&
						String(t.unitId) === String(this.selectedUnit)
					) {
						return sum + t.amount;
					}
					if (t.units) {
						const entry = t.units.find(
							(x) => String(x.unit) === String(this.selectedUnit)
						);
						if (entry) return sum + entry.amount;
					}
					return sum;
				}, 0);
		} else {
			return this.transactions
				.filter((t) => t.isDeposit)
				.filter((t) => {
					if (this.selectedRange.start && endDate) {
						const timestamp =
							parseInt(t._id.substring(0, 8), 16) * 1000;
						const txDate = new Date(timestamp);
						return (
							txDate >= this.selectedRange.start! &&
							txDate <= endDate
						);
					}
					return true;
				})
				.reduce((sum, t) => {
					if (t.unitId) return sum + t.amount;
					if (t.units)
						return sum + t.units.reduce((s, u) => s + u.amount, 0);
					return sum;
				}, 0);
		}
	}

	getExpenseTotal(): number {
		const endDate = this.selectedRange.end
			? this.getEndOfDay(this.selectedRange.end)
			: null;

		if (this.selectedUnit) {
			return this.filteredTransactions
				.filter((t) => !t.isDeposit)
				.reduce((sum, t) => {
					if (
						t.unitId &&
						String(t.unitId) === String(this.selectedUnit)
					) {
						return sum + t.amount;
					}
					if (t.units) {
						const entry = t.units.find(
							(x) => String(x.unit) === String(this.selectedUnit)
						);
						if (entry) return sum + entry.amount;
					}
					return sum;
				}, 0);
		} else {
			return this.transactions
				.filter((t) => !t.isDeposit)
				.filter((t) => {
					if (this.selectedRange.start && endDate) {
						const timestamp =
							parseInt(t._id.substring(0, 8), 16) * 1000;
						const txDate = new Date(timestamp);
						return (
							txDate >= this.selectedRange.start! &&
							txDate <= endDate
						);
					}
					return true;
				})
				.reduce((sum, t) => {
					if (t.unitId) return sum + t.amount;
					if (t.units)
						return sum + t.units.reduce((s, u) => s + u.amount, 0);
					return sum;
				}, 0);
		}
	}

	public getCircleTotal(): number {
		if (this.selectedUnit) {
			return this.transactions
				.filter(
					(t) =>
						String(t.unitId) === String(this.selectedUnit) ||
						(t.units &&
							t.units.some(
								(x) =>
									String(x.unit) === String(this.selectedUnit)
							))
				)
				.filter((t) => {
					if (this.selectedRange.start && this.selectedRange.end) {
						const start = this.selectedRange.start;
						const end = new Date(this.selectedRange.end);
						end.setHours(23, 59, 59, 999);
						const timestamp =
							parseInt(t._id.substring(0, 8), 16) * 1000;
						const txDate = new Date(timestamp);
						return txDate >= start && txDate <= end;
					}
					return true;
				})
				.reduce((sum, t) => {
					if (
						t.unitId &&
						String(t.unitId) === String(this.selectedUnit)
					) {
						return sum + (t.isDeposit ? t.amount : -t.amount);
					}
					if (t.units) {
						const entry = t.units.find(
							(x) => String(x.unit) === String(this.selectedUnit)
						);
						if (entry)
							return (
								sum +
								(t.isDeposit ? entry.amount : -entry.amount)
							);
					}
					return sum;
				}, 0);
		} else {
			return this.units
				.map((u) => {
					let txs = this.transactions.filter(
						(t) =>
							String(t.unitId) === String(u._id) ||
							(t.units &&
								t.units.some(
									(x) => String(x.unit) === String(u._id)
								))
					);

					if (this.selectedRange.start && this.selectedRange.end) {
						const start = this.selectedRange.start;
						const end = new Date(this.selectedRange.end);
						end.setHours(23, 59, 59, 999);
						txs = txs.filter((t) => {
							const timestamp =
								parseInt(t._id.substring(0, 8), 16) * 1000;
							const txDate = new Date(timestamp);
							return txDate >= start && txDate <= end;
						});
					}

					return txs.reduce((sum, t) => {
						if (t.unitId && String(t.unitId) === String(u._id)) {
							return sum + (t.isDeposit ? t.amount : -t.amount);
						}
						if (t.units) {
							const entry = t.units.find(
								(x) => String(x.unit) === String(u._id)
							);
							if (entry) {
								return (
									sum +
									(t.isDeposit ? entry.amount : -entry.amount)
								);
							}
						}
						return sum;
					}, 0);
				})
				.reduce((sum, amount) => sum + amount, 0);
		}
	}

	getCategoriesData() {
		const categories: { [key: string]: number } = {};

		if (this.selectedUnit) {
			this.filteredTransactions.forEach((t) => {
				const category = t.note || 'Без категорії';
				categories[category] = (categories[category] || 0) + t.amount;
			});
		} else {
			this.getFilteredUnits().forEach((u) => {
				if ((u.totalAmount || 0) > 0) {
					categories[u.name] = u.totalAmount!;
				}
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
		if (total === 0) return { background: '#ccc', borderRadius: '50%' };

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

		let start = 0;
		const entries = Object.entries(categories);
		const gradients = entries.map(([_, value], i) => {
			const percent = (value / total) * 100;
			const end = start + percent;
			const color = colors[i % colors.length];
			const g = `${color} ${start}% ${end}%`;
			start = end;
			return g;
		});

		return {
			background: `conic-gradient(${gradients.join(', ')})`,
			borderRadius: '50%',
			width: '200px',
			height: '200px'
		};
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
	getColorForUnit(unit: { name: string }) {
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
		const index = Object.keys(categories).indexOf(unit.name);
		return colors[index % colors.length];
	}
}
