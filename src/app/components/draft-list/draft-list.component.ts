import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DraftService } from '../../services/draft.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { DownloadService } from '../../services/download.service';

interface Draft {
  id?: string;
  title: string;
  content: string;
  timestamp: string;
}

@Component({
  selector: 'app-draft-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
  ],
  templateUrl: './draft-list.component.html',
  styleUrls: ['./draft-list.component.scss'],
})
export class DraftListComponent {
  private draftService = inject(DraftService);
  private downloadService = inject(DownloadService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

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
    this.router.navigate(['/editor/new']);
  }

  // Delete a draft
  deleteDraft(draftId: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Draft',
        message: 'Are you sure you want to delete this draft?',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.draftService.deleteDraft(draftId);
      }
    });
  }
}
