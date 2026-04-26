import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HallazgosPage } from './hallazgos.page';

describe('HallazgosPage', () => {
  let component: HallazgosPage;
  let fixture: ComponentFixture<HallazgosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HallazgosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
