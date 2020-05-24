import { Component, OnInit, OnDestroy } from '@angular/core';
import { BedService } from '../bed.service';
import { Bed } from '../models/bed';
import { timer, Subscription } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';


@Component({
	selector: 'app-beds',
	templateUrl: './beds.page.html',
	styleUrls: ['./beds.page.scss'],
})
export class BedsPage implements OnInit, OnDestroy {

	beds: Bed[];
	private readonly POLL_MS = 5000;
	bedPoller: Subscription;

	constructor(
		private bedService: BedService
	) { }
	
	ngOnDestroy(): void {
		this.bedPoller && this.bedPoller.unsubscribe();
	}

	ngOnInit() {
		this.bedPoller = timer(0, this.POLL_MS)
		.pipe(
			switchMap(() => this.bedService.getBeds()),
			tap(beds => {
				this.beds = beds;
			})
		)
		.subscribe();
	}



}
