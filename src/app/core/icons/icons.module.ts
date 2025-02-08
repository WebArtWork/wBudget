import { NgModule } from '@angular/core';
/* components */
import { MoneyComponent } from './money/money.component';
import { SpiderComponent } from './spider/spider.component';

const icons = [
	/* icons */
	MoneyComponent,
	SpiderComponent
];

@NgModule({
	declarations: icons,
	exports: icons
})
export class IconsModule {}
