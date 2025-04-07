import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CharacterService } from '../../services/character.service';
import { CharacterImageService } from '../../services/character-image.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { image } from 'html2canvas/dist/types/css/types/image';

@Component({
  selector: 'app-character-designer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './character-designer.component.html',
  styleUrls: ['./character-designer.component.scss'],
})
export class CharacterDesignerComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private characterService = inject(CharacterService);
  private characterImageService = inject(CharacterImageService);

  imageUrl = signal<string | null>(null);
  loadingImage = signal<boolean>(false);
  pendingImage = signal<string | null>(null); // Used for preview

  characterForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    age: ['', Validators.required],
    gender: ['', Validators.required],
    appearance: ['', Validators.required],
    personality: [''],
    backstory: [''],
  });

  saving = signal<boolean>(false);
  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCharacter(id);
    }
  }
  loadCharacter(id: string) {
    this.characterService.getCharacterById(id).subscribe({
      next: (character) => {
        this.characterForm.patchValue({
          name: character.name,
          age: character.age,
          gender: character.gender,
          appearance: character.appearance,
          personality: character.personality,
          backstory: character.backstory,
        });

        if (character.imageUrl) {
          this.imageUrl.set(character.imageUrl);
        }
      },
      error: (err) => {
        console.error('Failed to load character:', err);
      },
    });
  }

  saveCharacter() {
    if (this.characterForm.valid) {
      this.saving.set(true);

      const character = {
        ...this.characterForm.value,
        imageUrl: this.imageUrl(), // ✅ Include image if it was generated
      };

      this.characterService.saveCharacter(character).subscribe(() => {
        console.log('here');
        this.saving.set(false);
      });
    }
  }
  confirmImage() {
    this.imageUrl.set(this.pendingImage());
    this.pendingImage.set(null);
  }

  cancelImage() {
    this.pendingImage.set(null);
  }
  generateCharacterImage() {
    const appearance = this.characterForm.value.appearance;
    if (!appearance) return;

    this.loadingImage.set(true); // Show loading spinner

    this.characterImageService.generateImage(appearance).subscribe({
      next: (response) => {
        const url = response?.data?.[0]?.url;
        if (url) {
          this.pendingImage.set(url);
        } else {
          console.warn('No image URL returned');
        }
        this.loadingImage.set(false);
      },
      error: (err) => {
        console.error('Error generating image:', err);
        this.loadingImage.set(false);
      },
    });
  }
}
