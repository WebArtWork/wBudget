import { CrudDocument } from 'wacom';

export interface File extends CrudDocument {
	name: string;
	description: string;
}
