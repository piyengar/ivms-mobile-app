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
					this.updateNaNs(bed);
					this.updateStatus(bed);
				})
				this.beds = beds;
			}),
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

	private updateStatus(bed: Bed): void {
		const warningFactor = 0.05;
		let dSP = (bed.spO2Current - bed.spO2Minima) / bed.spO2Minima;
		let dBPSys = (bed.systolicBPMaxima - bed.bpSystolicCurrent) / bed.systolicBPMaxima;
		let dBPDia = (bed.bpDiastolicCurrent - bed.diastolicBPMaxima) / bed.diastolicBPMaxima;
		let dHRMax = (bed.heartRateMaxima - bed.heartRateCurrent) / bed.heartRateMaxima;
		let dHRMin = (bed.heartRateCurrent - bed.heartRateMinima) / bed.heartRateMinima;
		let min = Math.min(dSP, dBPSys, dBPDia, dHRMax, dHRMin);
		if (min < warningFactor) {
			if (min < 0) {
				bed.status = 2;
				return;
			}
			bed.status = 1;
			return;
		}
		bed.status = 0;
		return;
	}

	updateNaNs(bed: any) {
		bed.spO2Current = bed.spO2Current || 0;
		bed.bpSystolicCurrent = bed.bpSystolicCurrent || 0;
		bed.bpDiastolicCurrent = bed.bpDiastolicCurrent || 0;
		bed.heartRateCurrent = bed.heartRateCurrent || 0;
	}

}
