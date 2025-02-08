import { NgModule } from '@angular/core';
import { CoreModule } from 'src/app/core/core.module';
import { DocumentComponent } from './document.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		component: DocumentComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes), CoreModule],
	declarations: [DocumentComponent]
})
export class DocumentModule {}
