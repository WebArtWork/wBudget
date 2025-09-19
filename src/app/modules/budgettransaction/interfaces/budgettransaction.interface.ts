import { CrudDocument } from 'wacom';

export interface Budgettransaction extends CrudDocument {
	amount: number;
	note: string;
	budget: string;
	isDeposit: boolean;

	unitName?: string;
	budgetName?: string;

	unitId?: string;
	units?: {
		unit: string;
		amount: number;
	}[];
}
