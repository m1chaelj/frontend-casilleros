import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoSolicitudComponent } from './estado-solicitud.component';

describe('EstadoSolicitudComponent', () => {
  let component: EstadoSolicitudComponent;
  let fixture: ComponentFixture<EstadoSolicitudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadoSolicitudComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadoSolicitudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
