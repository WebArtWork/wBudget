import { CrudDocument } from 'wacom';

export interface Budgettransaction extends CrudDocument {
	amount: number;
	note: string;
	unitId?: string;
	budget: string;
	isDeposit: boolean;

	units?: {
		unit: string;
		amount: number;
	}[];
}
