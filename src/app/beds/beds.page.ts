import { Component, OnInit, OnDestroy } from '@angular/core';
import { BedService } from '../bed.service';
import { Bed } from '../models/bed';
import { timer, Subscription, of, Subject } from 'rxjs';
import { switchMap, map, tap, catchError } from 'rxjs/operators';


@Component({
	selector: 'app-beds',
	templateUrl: './beds.page.html',
	styleUrls: ['./beds.page.scss'],
})
export class BedsPage implements OnInit, OnDestroy {

	private readonly POLL_MS = 5000;
	private bedPoller: Subscription;
	private bedsSubject$: Subject<Bed[]> = new Subject();
	
	beds: Bed[];
	wardNo: string;
	floorNo: string;

	constructor(
		private bedService: BedService
	) { 
		this.bedsSubject$.pipe(
			switchMap(() => {
				return this.bedService.getBeds()
					.pipe(
						catchError(err => {
							console.log(err);
							return of([]);
						})
					)
			}),
			tap(beds => {
				beds.forEach(bed => {
					bed.status = Math.floor(Math.random() * 3);
				})
				this.beds = beds;
			}),
		).subscribe();
	}

	ngOnInit(): void {

	}

	ngOnDestroy(): void {
		console.log("destroying beds");
		this.bedsSubject$.unsubscribe();
	}

	ionViewDidLeave(): void {
		console.log("leaving beds");
		this.bedPoller && this.bedPoller.unsubscribe();
		
	}

	ionViewDidEnter() {
		console.log("starting beds poll");
		this.bedsSubject$.subscribe();
		this.bedPoller = timer(0, this.POLL_MS)
			.pipe(
				tap(_ => {
					this.bedsSubject$.next()
				})
			)
			.subscribe();
	}
}
