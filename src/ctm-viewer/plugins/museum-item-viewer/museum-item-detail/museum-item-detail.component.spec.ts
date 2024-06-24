import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MuseumItemDetailComponent } from './museum-item-detail.component';

describe('MuseumItemDetailComponent', () => {
  let component: MuseumItemDetailComponent;
  let fixture: ComponentFixture<MuseumItemDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MuseumItemDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MuseumItemDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
