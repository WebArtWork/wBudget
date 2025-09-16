import { Injectable } from '@angular/core';
import { Budgettransaction } from '../interfaces/budgettransaction.interface';
import { CrudService } from 'wacom';
import { Observable, of } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class BudgettransactionService extends CrudService<Budgettransaction> {
	budgettransactions: Budgettransaction[] = this.getDocs();

	budgettransactionsByAuthor: Record<string, Budgettransaction[]> = {};

	constructor() {
		super({
			name: 'budgettransaction'
		});

		this.get();

		this.filteredDocuments(this.budgettransactionsByAuthor);
	}
	getTransactionsByBudget(budgetId: string): Observable<Budgettransaction[]> {
		return this.get({ query: 'budget=' + budgetId });
	}
}
