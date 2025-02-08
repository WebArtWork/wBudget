import { NgModule } from '@angular/core';
import { CoreModule } from 'src/app/core/core.module';
import { TransactionsComponent } from './transactions.component';
import { Routes, RouterModule } from '@angular/router';
import { TransactionComponent } from './transaction/transaction.component';

const routes: Routes = [
	{
		path: '',
		component: TransactionsComponent
	},
	{
		path: ':budget',
		component: TransactionsComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes), CoreModule],
	declarations: [TransactionsComponent, TransactionComponent]
})
export class TransactionsModule {}
