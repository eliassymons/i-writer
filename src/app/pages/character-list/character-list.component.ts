import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Character, CharacterService } from '../../services/character.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-character-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './character-list.component.html',
  styleUrls: ['./character-list.component.scss'],
})
export class CharacterListComponent {
  private characterService = inject(CharacterService);
  private router = inject(Router);

  public characters = signal<Character[]>([]);
  public loading = signal<boolean>(true);

  constructor() {
    this.loadCharacters();
  }

  loadCharacters() {
    this.characterService.getCharacters().subscribe({
      next: (data) => {
        this.characters.set(data as Character[]);
        this.loading.set(false);
      },
      error: (err) => console.error('Error fetching characters:', err),
    });
  }

  editCharacter(id: string) {
    this.router.navigate([`/characters/${id}`]); // Navigate to edit page
  }

  deleteCharacter(id: string) {
    if (confirm('Are you sure you want to delete this character?')) {
      this.characterService.deleteCharacter(id).subscribe(() => {
        this.loadCharacters(); // Refresh the list after deletion
      });
    }
  }

  newCharacter() {
    this.router.navigate(['/characters/new']); // Navigate to new character form
  }
}
