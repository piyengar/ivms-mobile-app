import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, tap, switchMap } from 'rxjs/operators';
import { Bed } from '../models/bed';
import { Observable } from 'rxjs';
import { BedService } from '../bed.service';

@Component({
	selector: 'app-bed',
	templateUrl: './bed.page.html',
	styleUrls: ['./bed.page.scss'],
})
export class BedPage implements OnInit {

	bed: Bed;

	constructor(
		private route: ActivatedRoute,
		private bedService: BedService

	) { }

	ngOnInit() {
		this.route.paramMap.pipe(
			switchMap(params => {
				 let id =  +params.get('id');
				 return this.bedService.getBedMedicalData(id);
			}),
			tap(bed => {
				this.bed = bed;
			})
		).subscribe();
	}

}
