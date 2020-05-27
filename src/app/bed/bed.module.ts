import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BedPageRoutingModule } from './bed-routing.module';

import { BedPage } from './bed.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BedPageRoutingModule
  ],
  declarations: [BedPage]
})
export class BedPageModule {}
