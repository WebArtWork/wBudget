import { CrudDocument } from 'wacom';

export interface Budgettransaction extends CrudDocument {
	budget: string;
	note: string;
	amount: number;
}
