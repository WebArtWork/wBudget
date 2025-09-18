import {
	SimpleChanges,
	EventEmitter,
	Component,
	OnChanges,
	Output,
	Input
} from '@angular/core';
import { SelectModule } from 'src/app/core/modules/select/select.module';
import { BudgettransactionService } from '../../services/budgettransaction.service';
import { Budgettransaction } from '../../interfaces/budgettransaction.interface';

@Component({
	selector: 'budgettransaction-selector',
	templateUrl: './budgettransaction-selector.component.html',
	styleUrls: ['./budgettransaction-selector.component.scss'],
	imports: [SelectModule]
})
export class BudgettransactionSelectorComponent implements OnChanges {
	@Input() value: string;

	@Output() wChange = new EventEmitter();

	get items(): Budgettransaction[] {
		return this._budgettransactionService.budgettransactions;
	}

	constructor(private _budgettransactionService: BudgettransactionService) {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['value'] && !changes['value'].firstChange) {
			this.value = changes['value'].currentValue;
		}
	}
}
