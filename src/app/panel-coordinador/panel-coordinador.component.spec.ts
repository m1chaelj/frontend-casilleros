import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelCoordinadorComponent } from './panel-coordinador.component';

describe('PanelCoordinadorComponent', () => {
  let component: PanelCoordinadorComponent;
  let fixture: ComponentFixture<PanelCoordinadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelCoordinadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelCoordinadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
