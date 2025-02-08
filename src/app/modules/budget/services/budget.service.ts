import { Injectable } from '@angular/core';
import { Budget } from '../interfaces/budget.interface';
import { CoreService, CrudService } from 'wacom';

@Injectable({
	providedIn: 'root'
})
export class BudgetService extends CrudService<Budget> {
	budgets: Budget[] = this.getDocs();

	budgetsByAuthor: Record<string, Budget[]> = {};

	constructor(private _core: CoreService) {
		super({
			name: 'budget'
		});

		this.get();

		this.filteredDocuments(this.budgetsByAuthor);

		this._core
			.on('budgettransaction_create')
			.subscribe(this.get.bind(this));

		this._core
			.on('budgettransaction_update')
			.subscribe(this.get.bind(this));

		this._core
			.on('budgettransaction_delete')
			.subscribe(this.get.bind(this));
	}
}
