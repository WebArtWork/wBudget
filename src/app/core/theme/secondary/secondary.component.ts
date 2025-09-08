import { Component } from '@angular/core';
import { UserService } from 'src/app/modules/user/services/user.service';
import { Platform } from '@angular/cdk/platform';

@Component({
	selector: 'app-secondary',
	standalone: false,
	templateUrl: './secondary.component.html',
	styleUrl: './secondary.component.scss'
})
export class SecondaryComponent {
	showSidebar = false;

	hideSidebar(): void {
		if (!this._platform.ANDROID && !this._platform.IOS) {
			this.showSidebar = false;
		}
	}

	constructor(
		public us: UserService,
		public userService: UserService,
		private _platform: Platform
	) {}
	back(): void {
		window.history.back();
	}
}
