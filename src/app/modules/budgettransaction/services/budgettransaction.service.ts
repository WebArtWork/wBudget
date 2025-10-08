import { Injectable } from '@angular/core';
import { Budgettransaction } from '../interfaces/budgettransaction.interface';
import { CrudService } from 'wacom';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class BudgettransactionService extends CrudService<Budgettransaction> {
	budgettransactions: Budgettransaction[] = this.getDocs();
	budgettransactionsByAuthor: Record<string, Budgettransaction[]> = {};

	constructor(private http: HttpClient) {
		super({ name: 'budgettransaction' });
		this.get();
		this.filteredDocuments(this.budgettransactionsByAuthor);
	}

	getTransactionsByBudget(budgetId: string): Observable<Budgettransaction[]> {
		return this.get({ query: 'budget=' + budgetId });
	}

	getTransactionsByUnit(unitId: string): Observable<Budgettransaction[]> {
		return this.get({ query: 'unitId=' + unitId });
	}
	createTransaction(transaction: Budgettransaction) {
		return this.create(transaction);
	}
}
