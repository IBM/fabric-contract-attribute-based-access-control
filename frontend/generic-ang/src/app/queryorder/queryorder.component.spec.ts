import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryorderComponent } from './queryorder.component';

describe('QueryorderComponent', () => {
  let component: QueryorderComponent;
  let fixture: ComponentFixture<QueryorderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QueryorderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
