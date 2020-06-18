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
						tap((beds: Bed[]) => this.beds = beds),
						catchError(err => {
							console.log(err);
							return of([]);
						})
					)
			})
		).subscribe();
	}

	ngOnInit(): void {

	}

	ngOnDestroy(): void {
		// destroy only when the component is GCd
		this.bedsSubject$.unsubscribe();
	}

	ionViewDidLeave(): void {
		this.bedPoller && this.bedPoller.unsubscribe();

	}

	ionViewDidEnter() {
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
