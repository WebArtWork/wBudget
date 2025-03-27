import {
	Component,
	EventEmitter,
	Input,
	OnChanges,
	Output,
	SimpleChanges
} from '@angular/core';

/**
 * ButtonComponent is a reusable Angular component for buttons.
 * It supports multiple styles, custom classes, disabled states,
 * and emits events when clicked.
 */
@Component({
	selector: 'wbutton',
	templateUrl: './button.component.html',
	styleUrls: ['./button.component.scss'],
	standalone: false
})
export class ButtonComponent implements OnChanges {
	/**
	 * Defines the button style.
	 * Available options: 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link'.
	 * Default: 'primary'.
	 */
	@Input() type:
		| 'primary'
		| 'secondary'
		| 'success'
		| 'danger'
		| 'warning'
		| 'info'
		| 'light'
		| 'dark'
		| 'link' = 'primary';

	/**
	 * Additional CSS classes for the button.
	 * Default: ''.
	 */
	@Input() class = '';

	/**
	 * Controls whether the button is disabled.
	 * Default: false.
	 */
	@Input() disabled = false;

	/**
	 * Determines whether the button prevents form submission.
	 * If true, the button does not submit the form when inside a form.
	 * Default: false.
	 */
	@Input() disableSubmit = false;

	/**
	 * Custom function executed when the button is clicked.
	 * If undefined, the button behaves normally.
	 */
	@Input() click: (() => void) | undefined;

	/**
	 * Event emitted when the button is clicked.
	 */
	@Output() wClick = new EventEmitter<void>();

	/**
	 * Handles the click event.
	 * If the button is disabled, the event is ignored.
	 * Executes the custom click function if provided.
	 * Emits the wClick event.
	 */
	clicked(): void {
		if (this.disabled) {
			return;
		}

		if (typeof this.click === 'function') {
			this.click();
		}

		this.wClick.emit();
	}

	/**
	 * Updates the disabled state of the button.
	 * @param disabled - A boolean indicating whether the button should be disabled.
	 */
	setDisabled(disabled: boolean): void {
		this.disabled = disabled;
	}

	/**
	 * Detects input changes and updates properties accordingly.
	 * @param changes - A collection of changed input properties.
	 */
	ngOnChanges(changes: SimpleChanges): void {
		if (changes['disabled']) {
			this.disabled = changes['disabled'].currentValue;
		}

		if (changes['class']) {
			this.class = changes['class'].currentValue;
		}

		if (changes['type']) {
			this.type = changes['type'].currentValue;
		}

		if (changes['disableSubmit']) {
			this.disableSubmit = changes['disableSubmit'].currentValue;
		}
	}
}
