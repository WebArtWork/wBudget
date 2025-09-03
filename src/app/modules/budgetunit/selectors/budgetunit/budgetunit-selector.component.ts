import {
	SimpleChanges,
	EventEmitter,
	Component,
	OnChanges,
	Output,
	Input,
} from '@angular/core';
import { SelectModule } from 'src/app/core/modules/select/select.module';
import { BudgetunitService } from '../../services/budgetunit.service';
import { Budgetunit } from '../../interfaces/budgetunit.interface';

@Component({
	selector: 'budgetunit-selector',
	templateUrl: './budgetunit-selector.component.html',
	styleUrls: ['./budgetunit-selector.component.scss'],
	imports: [SelectModule],
})
export class BudgetunitSelectorComponent implements OnChanges {
	@Input() value: string;

	@Output() wChange = new EventEmitter();

	get items(): Budgetunit[] {
		return this._budgetunitService.budgetunits;
	}

	constructor(private _budgetunitService: BudgetunitService) {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['value'] && !changes['value'].firstChange) {
			this.value = changes['value'].currentValue;
		}
	}
}
