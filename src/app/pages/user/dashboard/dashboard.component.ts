import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { BudgetunitService } from 'src/app/modules/budgetunit/services/budgetunit.service';
import { UserService } from 'src/app/modules/user/services/user.service';

@Component({
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss'],
	standalone: false
})
export class DashboardComponent implements OnInit, OnDestroy {
	isMenuOpen = false;

	selectedBudget: string = localStorage.getItem('selectedBudgetId') || '';
	selectedRange: 'day' | 'week' | 'month' | 'year' = 'day';

	// юніти для відображення
	units: { name: string; cost: number }[] = [];

	private budgetListener: any;

	constructor(
		public userService: UserService,
		private _budgetunitService: BudgetunitService
	) {}

	ngOnInit() {
		// якщо є збережений бюджет
		if (this.selectedBudget) {
			this.loadUnits(this.selectedBudget);
		}

		// слухаємо глобальну подію зміни бюджету
		this.budgetListener = (event: any) => {
			const budgetId = event.detail;
			if (budgetId) {
				this.selectedBudget = budgetId;
				localStorage.setItem('selectedBudgetId', budgetId);
				this.loadUnits(budgetId);
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

	// завантаження юнітів для конкретного бюджету
	loadUnits(budgetId: string) {
		this._budgetunitService
			.getUnitsByBudget(budgetId)
			.subscribe((units) => {
				console.log('Юніти для бюджету', budgetId, units);
				this.units = units.map((u: any) => ({
					name: u.name,
					cost: Number(u.cost) || 0
				}));
			});
	}

	onRangeChange(range: 'day' | 'week' | 'month' | 'year') {
		this.selectedRange = range;
		console.log('Вибраний період:', this.selectedRange);
	}

	getTotalCost(): number {
		return this.units.reduce((sum, unit) => sum + unit.cost, 0);
	}
}
