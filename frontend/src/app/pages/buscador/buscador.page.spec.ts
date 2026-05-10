import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { BuscadorPage } from './buscador.page';
import { BuscadorService } from '../../services/buscador.service';

describe('BuscadorPage', () => {
  let component: BuscadorPage;
  let fixture: ComponentFixture<BuscadorPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: BuscadorService,
          useValue: {
            buscarPorParametros: () => of({ respuesta: { coincidencias: [] } })
          }
        }
      ]
    });

    fixture = TestBed.createComponent(BuscadorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
