import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Chart, ChartConfiguration } from 'chart.js';
import { Subscription, timer, of } from 'rxjs';
import { switchMap, tap, catchError, retry } from 'rxjs/operators';
import { BedService } from '../bed.service';
import { Bed } from '../models/bed';
import { EditThresholdComponent } from './edit-threshold/edit-threshold.component';
import { PatientData } from '../models/patient-data';

@Component({
	selector: 'app-bed',
	templateUrl: './bed.page.html',
	styleUrls: ['./bed.page.scss'],
})
export class BedPage implements OnInit {
	private readonly POLL_MS = 5000;
	private readonly MAX_SPO2_LEN = 100;
	private readonly spo2Labels = Array(this.MAX_SPO2_LEN).fill(0).map((v, i) => `         `);
	bedId: number;
	bed: Bed = {};
	spo2ChartData: number[] = Array(this.MAX_SPO2_LEN);
	private chartColors = {
		red: 'rgb(255, 99, 132)',
		orange: 'rgb(255, 159, 64)',
		yellow: 'rgb(255, 205, 86)',
		green: 'rgb(75, 192, 192)',
		blue: 'rgb(54, 162, 235)',
		purple: 'rgb(153, 102, 255)',
		grey: 'rgb(201, 203, 207)'
	};

	private bedDataPoller: Subscription;
	private bedRealtimeDataSub: Subscription;

	@ViewChild("spo2Canvas") spo2Canvas: ElementRef;
	private spo2Chart: Chart;

	constructor(
		private route: ActivatedRoute,
		private bedService: BedService,
		private modalController: ModalController
	) { }

	ngOnInit() {
	}

	ionViewDidEnter() {
		this.route.paramMap.pipe(
			tap(params => {
				this.bedId = +params.get('id');
				this.startBedDataPoller();
			})
		).subscribe();
		this.spo2Chart = new Chart(this.spo2Canvas.nativeElement, this.getChartOptions());
	}

	ionViewDidLeave() {
		this.stopBedDataPoller();
	}

	private startBedDataPoller() {
		this.bedDataPoller = timer(0, this.POLL_MS)
			.pipe(
				switchMap(() => {
					return this.bedService.getBedMedicalData(this.bedId)
						.pipe(
							catchError(err => {
								// console.log(err);
								return of(null);
							}),
						)
				}),
				tap(bed => {
					if (bed) {
						bed.rrCurrent = 14;
						bed.rrAvg = 14;
						bed.qtCurrent = 390;
						bed.qtAvg = 387;
						this.bed = bed;
					}
				}),
			)
			.subscribe();
		this.bedRealtimeDataSub = of(null)
			.pipe(
				switchMap(_ => this.bedService.getRealtimeData(this.bedId)),
				tap(data => {
					// console.log('new data', data.ppg);
					this.addSpO2Data(data.ppg);
				}),
				retry(),
				catchError(err => {
					console.log(err);
					return of(null);
				}),
			)
			.subscribe();
	}

	getBlinkClass(val: number, lb: number, ub: number) {
		let status = 0;
		if (val) {
			const warningFactor = -0.05;
			let params = [0];
			if (lb) {
				params.push((val - lb) / lb)
			}
			if (ub)
				params.push((ub - val) / ub);
			let dt = Math.min(...params);
			if (dt < 0) status = 1;
			if (dt < warningFactor) status = 2;
		}
		if (status == 1) return 'blink';
		if (status == 2) return 'blink-fast';
		return '';
	}

	addSpO2Data(newData: number[] = []) {
		this.spo2ChartData = this.spo2ChartData.concat(newData);
		if (this.spo2ChartData.length > this.MAX_SPO2_LEN) {
			this.spo2ChartData.splice(0, this.spo2ChartData.length - this.MAX_SPO2_LEN);
		}
		this.spo2Chart.data.datasets.forEach(dataset => {
			dataset.data = this.spo2ChartData;
		});
		this.spo2Chart.update({
			duration: 0,
			lazy: true
		});
	}

	async showEditThresholdModal() {
		let patientData: PatientData = {
			pID: this.bed.patientId,
			pName: this.bed.name,
			pAge: this.bed.age,
			pGender: this.bed.sex,
			pMinSysBP: this.bed.systolicBPMinima,
			pMaxSysBP: this.bed.systolicBPMaxima,
			pMaxHR: this.bed.heartRateMaxima,
			pMinHR: this.bed.heartRateMinima,
			pMinspO2: this.bed.spO2Minima,
			pBedNo: this.bed.bedNo,
			pWardNo: this.bed.wardNo,
		};
		const modal = await this.modalController.create({
			component: EditThresholdComponent,
			componentProps: {
				patientData: patientData,
				bed: this.bed
			},
			cssClass: 'edit-pt-modal'
		});
		await modal.present();
		await modal.onDidDismiss();
	}

	private stopBedDataPoller() {
		this.bedDataPoller && this.bedDataPoller.unsubscribe();
		this.bedRealtimeDataSub && this.bedRealtimeDataSub.unsubscribe();
	}

	private getChartOptions(): ChartConfiguration {
		return {
			type: 'line',
			data: {
				labels: this.spo2Labels,
				datasets: [
					{
						label: "SpO2(%)",
						data: this.spo2ChartData,
						showLine: true,
						fill: false,
						borderColor: this.chartColors.blue,
						backgroundColor: this.chartColors.blue,
						pointRadius: 0,
					}
				]
			},
			options: {
				scales: {
					xAxes: [{
						// type: 'linear',
						// distribution: 'series',
						display: true,
						scaleLabel: {
							display: true,
							labelString: 'Time'
						},
						ticks: {
							// stepSize: this.MAX_SPO2_LEN / 10
						}
					}],
					yAxes: [{
						display: true,
						// scaleLabel: {
						// 	display: true,
						// 	labelString: 'Value'
						// },
						ticks: {
							suggestedMax: 100,
							suggestedMin: 0,
							stepSize: 20
						},
						gridLines: {
							tickMarkLength: 3
						}
					}]
				}
			}
		};
	}

}
