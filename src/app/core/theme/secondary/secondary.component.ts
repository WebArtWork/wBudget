import { Component } from '@angular/core';
import { UserService } from 'src/app/modules/user/services/user.service';
import { Platform } from '@angular/cdk/platform';
import { Router } from '@angular/router';

@Component({
	selector: 'app-secondary',
	standalone: false,
	templateUrl: './secondary.component.html',
	styleUrl: './secondary.component.scss'
})
export class SecondaryComponent {
	showSidebar = false;
	selectedBudgetName: string | null = null;

	hideSidebar(): void {
		if (!this._platform.ANDROID && !this._platform.IOS) {
			this.showSidebar = false;
		}
	}

	constructor(
		public us: UserService,
		public userService: UserService,
		private _platform: Platform,
		private router: Router
	) {}
	ngOnInit(): void {
		const savedBudgetId = localStorage.getItem('selectedBudgetId');
		const savedBudgetName = localStorage.getItem('selectedBudgetName');

		if (savedBudgetId) {
			this.selectedBudgetName = savedBudgetName || null;
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
	createTransaction(): void {
		alert('Please select a budget');
	}
}
