import { Component, OnInit, Input } from '@angular/core';
import { PatientData } from 'src/app/models/patient-data';
import { ModalController } from '@ionic/angular';
import { BedService } from 'src/app/bed.service';
import { Bed } from 'src/app/models/bed';
import { catchError, tap, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
	selector: 'app-edit-threshold',
	templateUrl: './edit-threshold.component.html',
	styleUrls: ['./edit-threshold.component.scss'],
})
export class EditThresholdComponent implements OnInit {

	@Input() patientData: PatientData;
	@Input() bed: Bed;

	submitting = false;

	constructor(
		private modalController: ModalController,
		private bedService: BedService,
	) { }

	ngOnInit() { }

	dismissModal() {
		this.modalController.dismiss();
	}

	update(form){
		this.submitting = true;
		let data: FormData = new FormData();
		for(let k in this.patientData){
			data.append(k, this.patientData[k]);
		}
		this.bedService.updatePatientData(this.bed, data)
		.pipe(
			tap(_ => {
				this.modalController.dismiss();
			}),
			catchError(err => {
				alert('failed to update patient details');
				return of(null);
			}),
			finalize(() => {
				this.submitting = false;
			})
		)
		.subscribe();
	}

}
