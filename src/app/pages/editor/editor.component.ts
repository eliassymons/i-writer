import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuillEditorComponent, QuillModule } from 'ngx-quill';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ApiService } from '../../services/api.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { DraftService } from '../../services/draft.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { TitleDialogComponent } from '../../components/title-dialog/title-dialog.component';
import { EditTitleComponent } from '../../components/edit-title/edit-title.component';

interface ISuggestion {
  original: string;
  suggestion: string;
  start: number;
  length?: number;
  end?: number;
}

interface Draft {
  id?: string;
  title: string;
  content: string;
  timestamp: string;
}

interface RangeSelection {
  start: number;
  length: number;
}

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    MatDialogModule,
    CommonModule,
    FormsModule,
    QuillModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    EditTitleComponent,
    MatIconModule,
  ],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent {
  private apiService = inject(ApiService);
  private draftService = inject(DraftService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  public drafts = this.draftService.drafts;
  public editor = viewChild<QuillEditorComponent>('editor');

  public editorContent = signal<string>('');
  public titleEditOpen = signal<boolean>(false);

  private draftId = this.draftService.draftId;
  public currDraft = this.draftService.currentDraft;

  private selectedRange = signal<RangeSelection | null>(null);
  public selectedText = signal<string | null>(null);
  public currentSuggestion = signal<ISuggestion | null>(null);
  public loading = signal<boolean>(false);

  public quillConfig = {
    toolbar: [
      [{ header: [1, 2, false] }], // Headers (H1, H2)
      ['bold', 'italic', 'underline'], // Basic styling
      [{ list: 'ordered' }, { list: 'bullet' }], // Lists
      [{ align: [] }], // Alignment options
      ['blockquote', 'code-block'], // Quotes & Code
      ['clean'], // Remove formatting
    ],
  };

  constructor() {
    this.loadDrafts();
    this.route.paramMap.subscribe((params) => {
      this.draftId.set(params.get('id'));
      const validId = this.draftId();
      if (validId) this.loadDraft(validId);
    });
  }

  public onContentChanged(event: any) {
    this.editorContent.set(event.html); // Gets the full HTML content
  }
  // Detect selection changes in the editor
  public onSelectionChanged(event: any) {
    const quill = this.editor()?.quillEditor;
    if (!quill) return;

    const selection = quill.getSelection();
    if (selection && selection.length > 0) {
      this.selectedText.set(
        quill.getText(selection.index, selection.length).trim()
      );
      this.selectedRange.set({
        start: selection.index,
        length: selection.length,
      });
    } else {
      this.selectedText.set(null);
      this.selectedRange.set(null);
    }
  }
  // Send only the selected text for analysis
  public analyzeSelectedText() {
    if (!this.selectedText() || !this.selectedRange()) return;

    this.loading.set(true); // Show loading spinner

    this.apiService.generateAIResponse(this.selectedText()!).subscribe({
      next: (response) => {
        if (response.choices && response.choices[0]?.message?.content) {
          try {
            const parsedResponse = JSON.parse(
              response.choices[0].message.content
            );
            if (parsedResponse.suggestions?.length > 0) {
              const suggestionData: ISuggestion = {
                original: this.selectedText()!, // Ensure it's a string
                suggestion: parsedResponse.suggestions[0].suggestion ?? '',
                start: this.selectedRange()!.start,
                length: this.selectedRange()!.length,
              };

              this.currentSuggestion.set(suggestionData); // Now TypeScript is happy
            }
          } catch (error) {
            console.error('Error parsing AI response:', error);
          }
        }
      },
      error: (error) => {
        console.error('API request failed:', error);
      },
      complete: () => {
        this.loading.set(false); // Hide loading spinner when request is complete
      },
    });
  }

  // Accept AI suggestion and replace text
  public acceptSuggestion() {
    if (!this.selectedRange() || !this.currentSuggestion()) return;

    const quill = this.editor()?.quillEditor;
    if (!quill) return;

    const start = this.selectedRange()?.start ?? 0;
    const length = this.selectedRange()?.length ?? 0;
    const replacement = this.currentSuggestion()!;

    // Replace the selected text with the AI suggestion
    quill.deleteText(start, length);
    quill.insertText(start, replacement.suggestion, {
      background: 'lightgreen',
    });

    // Remove green highlight after 2 seconds
    setTimeout(() => {
      quill.formatText(start, replacement.length ?? 0, { background: false });
    }, 2000);

    // Reset selection state
    this.selectedText.set(null);
    this.currentSuggestion.set(null);
    this.selectedRange.set(null);
  }

  // Decline the suggestion (just clears the UI)
  public declineSuggestion() {
    this.selectedText.set(null);
    this.currentSuggestion.set(null);
    this.selectedRange.set(null);
  }
  // Save Current Draft

  saveCurrentDraft() {
    const id = this.draftId();
    const title = this.currDraft()?.title ?? '';
    const content = this.editorContent();

    if (!title) {
      const dialogRef = this.dialog.open(TitleDialogComponent, {
        data: { title: 'Untitled Draft' },
      });

      dialogRef.afterClosed().subscribe((newTitle) => {
        if (newTitle) {
          if (id) {
            this.draftService.updateDraft(id, newTitle, content);
          } else {
            this.draftService.saveDraft(newTitle, content);
          }
        }
      });
    } else {
      if (id) {
        this.draftService.updateDraft(id, title, content);
      } else {
        this.draftService.saveDraft(title, content);
      }
    }
  }

  // Load All Drafts
  public loadDrafts() {
    this.draftService.getDrafts();
  }
  // Load a Specific Draft
  // Load a draft if editing an existing one
  public loadDraft(draftId: string) {
    this.draftService.getDraftById(draftId).subscribe({
      next: (draft) => {
        this.editorContent.set(draft.content);
        const quill = this.editor()?.quillEditor;
        if (quill) quill.root.innerHTML = draft.content;
      },
      error: (error) => console.error('Error loading draft:', error),
    });
  }

  // Navigate back to draft selection
  backToDrafts() {
    this.router.navigate(['/']);
  }

  // Delete a Draft

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

  updateTitle(title: string): void {
    console.log(title);
    const id = this.draftId() ?? '';
    this.draftService.editDraftTitle(id, title);
    console.log('here');
    this.titleEditOpen.set(false);
  }
}
