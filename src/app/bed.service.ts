import { Injectable } from '@angular/core';
import { Observable, of, timer } from 'rxjs';
import { webSocket } from "rxjs/webSocket";
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Bed } from './models/bed';
import { MedicData } from './models/medic-data';
import { MedicDataRealtime } from './models/medic-data-realtime';
import { map } from 'rxjs/operators';

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

	getBeds(): Observable<Bed[]> {
		return this.http.get<Bed[]>(`${this.apiUrl}`);
	}

	getBedMedicalData(bedId: number): Observable<Bed> {
		// let bed: Bed = {
		// 	id: 234234,
		// 	name: "John Doe",
		// 	age: 40,
		// 	sex: "Male",
		// 	floor_number: "1",
		// 	bed_no: "12341234",
		// 	ip_address: "10.0.0.23",
		// 	ward_no: "12",
		// 	bed_id: `${bedId}`,
		// 	time: "12:30 PM",
		// 	tempCurrent: 39.7,
		// 	tempAvg: 39.1,
		// 	bpmCurrent: 15,
		// 	bpmAvg: 15,
		// 	bpCurrent: 15,
		// 	bpAvg: 15,
		// 	spO2Current: 15,
		// 	spO2Avg: 15,
		// };
		// return of(bed);
		return this.http.get<Bed>(`${this.apiUrl}/${bedId}`);
	}

	getRealtimeData(bedId: number): Observable<MedicDataRealtime> {
		let url = `${this.apiUrl}/${bedId}/medicDataRealtime`.replace(/^http/, 'ws');
		let oldSpo2 = 90;
		const delta = 2;
		return timer(0, 500)
		.pipe(
			map(n => {
				let data: MedicDataRealtime = {
					spo2: []
				}
				for (let i = 0; i < 10; i++) {
					let hi = Math.min(oldSpo2 + delta, 100);
					let lo = Math.max(oldSpo2 - delta, 0);
					oldSpo2 = +(lo + (hi - lo) * Math.random()).toFixed(2);
					data.spo2[i] = oldSpo2;
				}
				return data;
			})
		);
		// return webSocket<MedicDataRealtime>({
		// 	url: url,
		// 	deserializer: (e => {
		// 		return e.data;
		// 	})
		// });
	}
}
