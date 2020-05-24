import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

	getBeds() : Observable<Bed[]> {
		return this.http.get<Bed[]>(`${this.apiUrl}/all`);
	}

	getBedMedicalData(bedId: string) : Observable<MedicData> {
		return this.http.get<MedicData>(`${this.apiUrl}/${bedId}/medicData`);
	}

	getRealtimeData(bedId: string): Observable<MedicDataRealtime> {
		let url = `${this.apiUrl}/${bedId}/medicDataRealtime`.replace(/^http/, 'ws');
		return webSocket<MedicDataRealtime>({
			url : url,
			deserializer : (e => {
				return e.data;
			})
		});
	}
}
