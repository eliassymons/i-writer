import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DraftService } from '../../services/draft.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

interface Draft {
  id?: string;
  title: string;
  content: string;
  timestamp: string;
}

@Component({
  selector: 'app-draft-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatListModule],
  templateUrl: './draft-list.component.html',
  styleUrls: ['./draft-list.component.scss'],
})
export class DraftListComponent {
  private draftService = inject(DraftService);
  private router = inject(Router);

  public drafts = this.draftService.drafts;

  constructor() {
    this.loadDrafts();
  }

  // Load all drafts
  loadDrafts() {
    this.draftService.getDrafts();
  }

  // Navigate to the editor with a selected draft
  editDraft(draftId: string) {
    this.router.navigate(['/editor', draftId]);
  }

  // Start a new draft
  newDraft() {
    this.router.navigate(['/editor']);
  }

  // Delete a draft
  deleteDraft(draftId: string) {
    if (!confirm('Are you sure you want to delete this draft?')) return;

    this.draftService.deleteDraft(draftId);
  }
}
