import { Injectable } from '@angular/core';
import { CrudService } from 'wacom';
import { Budgetunit } from '../interfaces/budgetunit.interface';

@Injectable({
	providedIn: 'root'
})
export class BudgetunitService extends CrudService<Budgetunit> {
	budgetunits: Budgetunit[] = this.getDocs();

	budgetunitsByAuthor: Record<string, Budgetunit[]> = {};

	constructor() {
		super({
			name: 'budgetunit'
		});

		this.filteredDocuments(this.budgetunitsByAuthor);
	}
}
