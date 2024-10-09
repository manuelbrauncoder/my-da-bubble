import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacyPoliciyComponent } from './privacy.component';

describe('PrivacyPoliciyComponent', () => {
  let component: PrivacyPoliciyComponent;
  let fixture: ComponentFixture<PrivacyPoliciyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyPoliciyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivacyPoliciyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
