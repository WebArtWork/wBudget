import { Injectable } from '@angular/core';
import { CrudService } from 'wacom';
import { Budgetunit } from '../interfaces/budgetunit.interface';
import { Observable, of } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class BudgetunitService extends CrudService<Budgetunit> {
	budgetunits: Budgetunit[] = this.getDocs();

	constructor() {
		super({ name: 'budgetunit' });
	}

	getUnitsByBudget(budgetId: string): Observable<Budgetunit[]> {
		const filtered = this.budgetunits.filter((u) => u.budget === budgetId);
		return of(filtered);
	}
}
