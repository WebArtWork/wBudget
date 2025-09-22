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
		this.dateRangeListener = (event: any) => {
			this.selectedRange = event.detail;
		};
		window.addEventListener('dateRangeChanged', this.dateRangeListener);
		// Відновлення вибраного діапазону після перезавантаження
		const saved = localStorage.getItem('dateRange');
		if (saved) {
			const parsed = JSON.parse(saved);
			this.selectedRange = {
				start: parsed.start ? new Date(parsed.start) : null,
				end: parsed.end ? new Date(parsed.end) : null
			};
		}

		// Слухаємо події з PublicComponent
		this.dateRangeListener = (event: any) => {
			this.selectedRange = {
				start: event.detail.start ? new Date(event.detail.start) : null,
				end: event.detail.end ? new Date(event.detail.end) : null
			};
		};
		window.addEventListener('dateRangeChanged', this.dateRangeListener);
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

	selectUnit(unitId: string) {
		this.selectedUnit = unitId;
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
			if (String(t.unitId) !== String(this.selectedUnit)) return false;

			if (this.selectedRange.start && this.selectedRange.end && t._id) {
				const timestamp = parseInt(t._id.substring(0, 8), 16) * 1000;
				const txDate = new Date(timestamp);

				const endDate = this.getEndOfDay(this.selectedRange.end);
				return txDate >= this.selectedRange.start && txDate <= endDate;
			}
			return true;
		});
	}

	getFilteredUnits(): (Budgetunit & { totalAmount: number })[] {
		const endDate = this.selectedRange.end
			? this.getEndOfDay(this.selectedRange.end)
			: null;

		return this.units.map((u) => {
			let txs = this.transactions.filter(
				(t) => String(t.unitId) === String(u._id)
			);

			if (this.selectedRange.start && endDate) {
				txs = txs.filter((t) => {
					const timestamp =
						parseInt(t._id.substring(0, 8), 16) * 1000;
					const txDate = new Date(timestamp);
					return (
						txDate >= this.selectedRange.start! && txDate <= endDate
					);
				});
			}

			const totalAmount = txs.reduce(
				(sum, t) => sum + (t.isDeposit ? t.amount : -t.amount),
				0
			);
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
				.reduce((sum, t) => sum + t.amount, 0);
		} else {
			return this.getFilteredUnits().reduce((sum, u) => {
				const income = this.transactions
					.filter(
						(t) => String(t.unitId) === String(u._id) && t.isDeposit
					)
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
					.reduce((s, t) => s + t.amount, 0);
				return sum + income;
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
				.reduce((sum, t) => sum + t.amount, 0);
		} else {
			return this.getFilteredUnits().reduce((sum, u) => {
				const expense = this.transactions
					.filter(
						(t) =>
							String(t.unitId) === String(u._id) && !t.isDeposit
					)
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
					.reduce((s, t) => s + t.amount, 0);
				return sum + expense;
			}, 0);
		}
	}
	public getCircleTotal(): number {
		if (this.selectedUnit) {
			// Фільтруємо транзакції тільки для вибраного юніта
			return this.transactions
				.filter((t) => String(t.unitId) === String(this.selectedUnit))
				.filter((t) => {
					if (this.selectedRange.start && this.selectedRange.end) {
						const start = this.selectedRange.start;
						const end = new Date(this.selectedRange.end);
						end.setHours(23, 59, 59, 999); // включно до кінця дня
						const timestamp =
							parseInt(t._id.substring(0, 8), 16) * 1000;
						const txDate = new Date(timestamp);
						return txDate >= start && txDate <= end;
					}
					return true;
				})
				.reduce(
					(sum, t) => sum + (t.isDeposit ? t.amount : -t.amount),
					0
				);
		} else {
			// Для всіх юнітів: беремо їхні totalAmount з урахуванням дат
			return this.units
				.map((u) => {
					let txs = this.transactions.filter(
						(t) => String(t.unitId) === String(u._id)
					);

					if (this.selectedRange.start && this.selectedRange.end) {
						const start = this.selectedRange.start;
						const end = new Date(this.selectedRange.end);
						end.setHours(23, 59, 59, 999); // включно до кінця дня
						txs = txs.filter((t) => {
							const timestamp =
								parseInt(t._id.substring(0, 8), 16) * 1000;
							const txDate = new Date(timestamp);
							return txDate >= start && txDate <= end;
						});
					}

					return txs.reduce(
						(sum, t) => sum + (t.isDeposit ? t.amount : -t.amount),
						0
					);
				})
				.reduce((sum, amount) => sum + amount, 0);
		}
	}

	getCategoriesData() {
		const categories: { [key: string]: number } = {};

		if (this.selectedUnit) {
			// Для транзакцій вибраного юніта
			this.filteredTransactions.forEach((t) => {
				const category = t.note || 'Без категорії';
				categories[category] = (categories[category] || 0) + t.amount;
			});
		} else {
			// Для всіх юнітів беремо тільки ті, де totalAmount > 0
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
			const color = colors[i % colors.length]; // кожна категорія свій колір
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
