import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '../translate/translate.module';
import { InputComponent } from './input.component';

@NgModule({
	imports: [FormsModule, CommonModule, TranslateModule],
	declarations: [InputComponent],
	providers: [],
	exports: [InputComponent]
})
export class InputModule {}
