import {
	SimpleChanges,
	EventEmitter,
	Component,
	OnChanges,
	Output,
	Input,
} from '@angular/core';
import { SelectModule } from 'src/app/core/modules/select/select.module';
import { BudgetService } from '../../services/budget.service';
import { Budget } from '../../interfaces/budget.interface';

@Component({
	selector: 'budget-selector',
	templateUrl: './budget-selector.component.html',
	styleUrls: ['./budget-selector.component.scss'],
	imports: [SelectModule],
})
export class BudgetSelectorComponent implements OnChanges {
	@Input() value: string;

	@Output() wChange = new EventEmitter();

	get items(): Budget[] {
		return this._budgetService.budgets;
	}

	constructor(private _budgetService: BudgetService) {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['value'] && !changes['value'].firstChange) {
			this.value = changes['value'].currentValue;
		}
	}
}
