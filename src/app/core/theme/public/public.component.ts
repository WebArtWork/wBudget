import { Platform } from '@angular/cdk/platform';
import { Component, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { budgettransactionFormComponents } from 'src/app/modules/budgettransaction/formcomponents/budgettransaction.formcomponents';
import { Budgettransaction } from 'src/app/modules/budgettransaction/interfaces/budgettransaction.interface';
import { BudgettransactionService } from 'src/app/modules/budgettransaction/services/budgettransaction.service';
import { UserService } from 'src/app/modules/user/services/user.service';
import { FormService } from '../../modules/form/form.service';

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

	private _formService = inject(FormService);

	private _transactionService = inject(BudgettransactionService);

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
