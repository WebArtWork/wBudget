import { Component } from '@angular/core';

@Component({
	templateUrl: './document.component.html',
	styleUrls: ['./document.component.scss'],
	standalone: false
})
export class DocumentComponent {
	isMenuOpen = false;

	// Метод для переключення класів
	toggleMenu(): void {
		this.isMenuOpen = !this.isMenuOpen;
		console.log('Menu Open: ', this.isMenuOpen); // Перевірка значення
	}
}
