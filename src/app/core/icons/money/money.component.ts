import { Component, Input } from '@angular/core';

@Component({
	selector: 'money-icon',
	templateUrl: './money.component.html',
	styleUrls: ['./money.component.scss'],
	standalone: false
})
export class MoneyComponent {
	@Input() color = 'black';
}
