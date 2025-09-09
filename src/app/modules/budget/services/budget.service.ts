import { Injectable } from '@angular/core';
import { Budget } from '../interfaces/budget.interface';
import { CrudService } from 'wacom';

@Injectable({
	providedIn: 'root'
})
export class BudgetService extends CrudService<Budget> {
	budgets: Budget[] = this.getDocs();

	budgetsByAuthor: Record<string, Budget[]> = {};

	constructor() {
		super({
			name: 'budget'
		});

		this.get();

		this.filteredDocuments(this.budgetsByAuthor);
	}
	async getAllBudgets(): Promise<Budget[]> {
		return await this.getDocs();
	}
}
