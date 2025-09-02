import { NgModule } from '@angular/core';
import { CoreModule } from 'src/app/core/core.module';
import { FilesComponent } from './files.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		component: FilesComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes), CoreModule],
	declarations: [FilesComponent],
	providers: []
})
export class FilesModule {}
