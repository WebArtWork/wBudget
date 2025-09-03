import { CrudDocument } from 'wacom';

export interface Budgetunit extends CrudDocument {
	name: string;
	description: string;
	type: string;
}
