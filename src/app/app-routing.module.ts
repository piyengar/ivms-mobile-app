import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: 'beds/:id',
		loadChildren: () => import('./bed/bed.module').then(m => m.BedPageModule)
	},
	{
		path: 'beds',
		loadChildren: () => import('./beds/beds.module').then(m => m.BedsPageModule)
	},
	{ path: '', redirectTo: 'beds', pathMatch: 'full' },
];
@NgModule({
	imports: [
		RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
	],
	exports: [RouterModule]
})
export class AppRoutingModule { }
