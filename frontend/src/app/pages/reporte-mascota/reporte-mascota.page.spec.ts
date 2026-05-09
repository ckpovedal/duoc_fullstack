import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReporteMascotaPage } from './reporte-mascota.page';

describe('ReporteMascotaPage', () => {
  let component: ReporteMascotaPage;
  let fixture: ComponentFixture<ReporteMascotaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteMascotaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
