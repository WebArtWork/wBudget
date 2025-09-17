import { CrudDocument } from 'wacom';

export interface Budgettransaction extends CrudDocument {
	amount: string;
	note: string;
	unitId?: string;
	budget: string;
	isDeposit: string;

	units?: {
		unit: string;
		amount: number;
	}[];
}
