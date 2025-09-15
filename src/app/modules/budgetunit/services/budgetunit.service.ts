import { Injectable } from '@angular/core';
import { CrudService } from 'wacom';
import { Budgetunit } from '../interfaces/budgetunit.interface';
import { Observable, of } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class BudgetunitService extends CrudService<Budgetunit> {
	constructor() {
		super({ name: 'budgetunit' });
	}

	getUnitsByBudget(budgetId: string): Observable<Budgetunit[]> {
		return this.get({ query: 'budget=' + budgetId });
	}
}
