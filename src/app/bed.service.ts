import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { webSocket } from "rxjs/webSocket";
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Bed } from './models/bed';
import { MedicData } from './models/medic-data';
import { MedicDataRealtime } from './models/medic-data-realtime';

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
		return this.http.get<Bed[]>(`${this.apiUrl}/all`);
	}

	getBedMedicalData(bedId: number): Observable<Bed> {
		let bed: Bed = {
			id: 234234,
			name: "John Doe",
			age: 40,
			sex: "Male",
			floor_number: "1",
			bed_no: "12341234",
			ip_address: "10.0.0.23",
			ward_no: "12",
			bed_id: `${bedId}`,
			time: "12:30 PM",
			tempCurrent: 39.7,
			tempAvg: 39.1,
			bpmCurrent: 15,
			bpmAvg: 15,
			bpCurrent: 15,
			bpAvg: 15,
			spO2Current: 15,
			spO2Avg: 15,
		};
		return of(bed);
		// return this.http.get<Bed>(`${this.apiUrl}/${bedId}/medicData`);
	}

	getRealtimeData(bedId: string): Observable<MedicDataRealtime> {
		let url = `${this.apiUrl}/${bedId}/medicDataRealtime`.replace(/^http/, 'ws');
		return webSocket<MedicDataRealtime>({
			url: url,
			deserializer: (e => {
				return e.data;
			})
		});
	}
}
