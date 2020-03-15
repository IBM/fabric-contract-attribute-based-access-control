import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrollComponent } from './enroll.component';

describe('EnrollComponent', () => {
  let component: EnrollComponent;
  let fixture: ComponentFixture<EnrollComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnrollComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
