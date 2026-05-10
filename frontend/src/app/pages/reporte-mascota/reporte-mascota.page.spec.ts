import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { of } from 'rxjs';
import { ReporteMascotaPage } from './reporte-mascota.page';
import { HallazgoService } from '../../services/hallazgo.service';
import { PerdidaService } from '../../services/perdida.service';

describe('ReporteMascotaPage', () => {
  let component: ReporteMascotaPage;
  let fixture: ComponentFixture<ReporteMascotaPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HallazgoService,
          useValue: {
            crearHallazgo: () => of({})
          }
        },
        {
          provide: PerdidaService,
          useValue: {
            crearPerdida: () => of({})
          }
        },
        {
          provide: Router,
          useValue: {
            navigate: () => Promise.resolve(true)
          }
        },
        {
          provide: ToastController,
          useValue: {
            create: () => Promise.resolve({
              present: () => Promise.resolve()
            })
          }
        }
      ]
    });

    fixture = TestBed.createComponent(ReporteMascotaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
