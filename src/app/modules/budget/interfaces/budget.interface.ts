import { CrudDocument } from 'wacom';

export interface Budget extends CrudDocument {
	name: string;
	description: string;
	thumb: string;
	amount: number;
	currency: string;
}
