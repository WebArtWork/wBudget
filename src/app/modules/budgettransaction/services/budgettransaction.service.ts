import { Injectable } from '@angular/core';
import { Budgettransaction } from '../interfaces/budgettransaction.interface';
import { CrudService } from 'wacom';

@Injectable({
	providedIn: 'root'
})
export class BudgettransactionService extends CrudService<Budgettransaction> {
	constructor() {
		super({
			name: 'budgettransaction'
		});
	}
}
