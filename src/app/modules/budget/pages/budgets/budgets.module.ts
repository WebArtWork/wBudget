import { NgModule } from '@angular/core';
import { CoreModule } from 'src/app/core/core.module';
import { BudgetsComponent } from './budgets.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		component: BudgetsComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes), CoreModule],
	declarations: [BudgetsComponent],
	providers: []
})
export class BudgetsModule {}
