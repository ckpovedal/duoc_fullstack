import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerdidasPage } from './perdidas.page';

describe('PerdidasPage', () => {
  let component: PerdidasPage;
  let fixture: ComponentFixture<PerdidasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PerdidasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
