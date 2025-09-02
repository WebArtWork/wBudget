import { Component } from '@angular/core';
import { UserService } from 'src/app/modules/user/services/user.service';

@Component({
	selector: 'app-public',
	standalone: false,
	templateUrl: './public.component.html',
	styleUrl: './public.component.scss'
})
export class PublicComponent {
	constructor(public us: UserService) {}
}
