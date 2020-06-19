import { Injectable } from '@angular/core';
import { Observable, of, timer, pipe } from 'rxjs';
import { webSocket } from "rxjs/webSocket";
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Bed } from './models/bed';
import { MedicData } from './models/medic-data';
import { MedicDataRealtime } from './models/medic-data-realtime';
import { map, tap } from 'rxjs/operators';
import { PatientData } from './models/patient-data';

@Injectable({
	providedIn: 'root'
})
export class BedService {

	private readonly API_SUB_PATH = "/beds";
	private apiUrl: string;

	constructor(
		private http: HttpClient

	) {
		this.apiUrl = `${environment.serverUrl}${this.API_SUB_PATH}`;
	}

	private cleanupBedData(bed: Bed) {
		bed.rrCurrent = 14;
		bed.rrAvg = 14;
		bed.qtCurrent = 390;
		bed.qtAvg = 387;
		this.updateNaNs(bed);
		this.updateStatus(bed);
	}

	private updateNaNs(bed: any) {
		bed.spO2Current = bed.spO2Current || 0;
		bed.bpSystolicCurrent = bed.bpSystolicCurrent || 0;
		bed.bpDiastolicCurrent = bed.bpDiastolicCurrent || 0;
		bed.heartRateCurrent = bed.heartRateCurrent || 0;
		bed.heartRateMaxima = bed.heartRateMaxima || 140;
		bed.heartRateMinima = bed.heartRateMinima || 60;
		bed.systolicBPMinima = bed.systolicBPMinima || 90;
		bed.systolicBPMaxima = bed.systolicBPMaxima || 140;
		bed.spO2Minima = bed.spO2Minima || 92;
	}

	private updateStatus(bed: Bed): void {
		const warningFactor = -0.05;
		let params = [0];
		params.push((bed.spO2Current - bed.spO2Minima) / bed.spO2Minima);
		params.push((bed.systolicBPMaxima - bed.bpSystolicCurrent) / bed.systolicBPMaxima);
		params.push((bed.bpSystolicCurrent - bed.systolicBPMinima) / bed.systolicBPMinima);
		params.push((bed.heartRateMaxima - bed.bpmCurrent) / bed.heartRateMaxima);
		params.push((bed.bpmCurrent - bed.heartRateMinima) / bed.heartRateMinima);
		let min = Math.min(...params);
		if (min < 0) {
			if (min < warningFactor) {
				bed.status = 2;
				return;
			}
			bed.status = 1;
			return;
		}
		bed.status = 0;
		return;
	}

	getBeds(): Observable<Bed[]> {
		return this.http.get<Bed[]>(`${this.apiUrl}`)
			.pipe(
				map(beds => {
					if (beds && beds.length) {
						beds.forEach((bed: Bed) => {
							this.cleanupBedData(bed);
						});
					}
					return beds;
				}),
			);
	}

	getBedMedicalData(bedId: number): Observable<Bed> {
		return this.http.get<Bed>(`${this.apiUrl}/${bedId}`)
			.pipe(
				map(bed => {
					if (bed) {
						this.cleanupBedData(bed);
					}
					return bed;
				}),
			);;
	}

	getRealtimeData(bedId: number): Observable<MedicDataRealtime> {
		let url = `${this.apiUrl}/${bedId}/realtime`.replace(/^http/, 'ws');
		return webSocket<MedicDataRealtime>({
			url: url,
		}).pipe(
			map(data => {
				// console.log('ws recd data', data);
				return data;
			})
		);
	}

	updatePatientData(bed: Bed, data: FormData): Observable<void> {
		let url = `http://${bed.ipAddress}`;
		return this.http.post(url, data)
			.pipe(
				map(ret => null)
			);
	}
}
