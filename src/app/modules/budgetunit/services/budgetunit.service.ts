import { Injectable } from '@angular/core';
import { Budgetunit } from '../interfaces/budgetunit.interface';
import { CrudService } from 'wacom';

@Injectable({
	providedIn: 'root',
})
export class BudgetunitService extends CrudService<Budgetunit> {
	budgetunits: Budgetunit[] = this.getDocs();

	budgetunitsByAuthor: Record<string, Budgetunit[]> = {};

	constructor() {
		super({
			name: 'budgetunit',
		});

		this.get();

		this.filteredDocuments(this.budgetunitsByAuthor);
	}
}
