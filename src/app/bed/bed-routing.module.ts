import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BedPage } from './bed.page';

const routes: Routes = [
  {
    path: '',
    component: BedPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BedPageRoutingModule {}
