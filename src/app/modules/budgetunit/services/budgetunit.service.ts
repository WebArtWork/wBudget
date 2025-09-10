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
		const allUnits = this.getDocs(); // отримуємо всі юніти з кешу
		const unitsForBudget = allUnits.filter((u) => u.budget === budgetId);
		return of(unitsForBudget);
	}
}
