type StatusCode = 0 | 1 | 2;
export interface Bed {
	id?: string;
	name?: string;
	age?: number;
	sex?: string;
	floorNumber?: string;
	bedNo?: string;
	ipAddress?: string;
	wardNo?: string;
	bedId?: string;
	time?: string;

	// bpmCurrent?: number;
	// bpmAvg?: number;

	bpDiastolicAvg?: number;
	bpDiastolicCurrent?: number;
	
	bpSystolicAvg?: number;
	bpSystolicCurrent?: number;
	systolicBPMinima?: number;
	systolicBPMaxima?: number;

	heartRateMaxima?: number;
	heartRateMinima?: number;
	heartRateCurrent?: number;
	heartRateAvg?: number;

	spO2Current?: number;
	spO2Avg?: number;
	spO2Minima?: number;

	rrCurrent?: number;
	rrAvg?: number;

	qtCurrent?: number;
	qtAvg?: number;

	status?: StatusCode;
}
