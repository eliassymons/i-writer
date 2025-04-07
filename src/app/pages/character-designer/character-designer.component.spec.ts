import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterDesignerComponent } from './character-designer.component';

describe('CharacterDesignerComponent', () => {
  let component: CharacterDesignerComponent;
  let fixture: ComponentFixture<CharacterDesignerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterDesignerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharacterDesignerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
