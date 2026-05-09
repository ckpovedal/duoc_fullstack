import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HallazgosPage } from './hallazgos.page';
import { HallazgoService } from '../../services/hallazgo.service';

describe('HallazgosPage', () => {
  let component: HallazgosPage;
  let fixture: ComponentFixture<HallazgosPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HallazgoService,
          useValue: {
            listarHallazgos: () => of([])
          }
        }
      ]
    });

    fixture = TestBed.createComponent(HallazgosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
