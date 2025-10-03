import { CrudDocument } from 'wacom';

export interface Budget extends CrudDocument {
	_id: string;
	name: string;
	description: string;
	amount: Number;
	currency: String;
	balance?: number;
}
