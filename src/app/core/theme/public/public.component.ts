import { Component } from '@angular/core';
import { UserService } from 'src/app/modules/user/services/user.service';
import { Platform } from '@angular/cdk/platform';

import { FormInterface } from 'src/app/core/modules/form/interfaces/form.interface';
@Component({
	selector: 'app-public',
	standalone: false,
	templateUrl: './public.component.html',
	styleUrl: './public.component.scss'
})
export class PublicComponent {
	showSidebar = false;

	hideSidebar(): void {
		if (!this._platform.ANDROID && !this._platform.IOS) {
			this.showSidebar = false;
		}
	}

	isMenuOpen = false;

	budgets = ['Особистий', 'Сімейний', 'Бізнес'];
	units = ['Їжа', 'Транспорт', 'Житло', 'Розваги'];
	ranges = ['day', 'week', 'month', 'year'];

	isDropdownOpen = false;
	isUnitDropdownOpen = false;
	isRangeDropdownOpen = false;

	selectedRange: string = '';
	selectedBudget: string = '';
	selectedUnit: string = '';
	selectedUnits: string[] = [];

	constructor(
		public us: UserService,
		public userService: UserService,
		private _platform: Platform
	) {}

	back(): void {
		window.history.back();
	}

	onBudgetChange() {
		console.log('Вибраний бюджет:', this.selectedBudget);
	}

	onUnitChange() {
		console.log('Вибрані юніти:', this.selectedUnits);
	}

	onRangeChange() {
		console.log('Вибрано період:', this.selectedRange);
	}
}
