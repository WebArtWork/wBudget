import { CrudDocument } from 'wacom';

export interface Budgetunit extends CrudDocument {
	name: string;
	cost: Number;
	budget: string;
}
