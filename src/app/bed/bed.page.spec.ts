import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BedPage } from './bed.page';

describe('BedPage', () => {
  let component: BedPage;
  let fixture: ComponentFixture<BedPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BedPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
