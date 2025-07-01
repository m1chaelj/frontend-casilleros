import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubirPagoComponent } from './subir-pago.component';

describe('SubirPagoComponent', () => {
  let component: SubirPagoComponent;
  let fixture: ComponentFixture<SubirPagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubirPagoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubirPagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
