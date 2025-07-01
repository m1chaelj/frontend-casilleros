import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineAlumnoComponent } from './timeline-alumno.component';

describe('TimelineAlumnoComponent', () => {
  let component: TimelineAlumnoComponent;
  let fixture: ComponentFixture<TimelineAlumnoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineAlumnoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimelineAlumnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
