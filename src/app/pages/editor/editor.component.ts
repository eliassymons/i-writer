import {
  Component,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
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
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { DownloadService } from '../../services/download.service';

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
  private downloadService = inject(DownloadService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  public drafts = this.draftService.drafts;
  public editor = viewChild<QuillEditorComponent>('editor');

  public editorContent = signal<string>('');
  public titleEditOpen = signal<boolean>(false);

  private draftId = this.draftService.draftId;
  public currDraft = this.draftService.currentDraft;

  public draftTitle = signal<string>('Untitled Draft');

  public dirty = signal<boolean>(false);
  public editorDisabled = signal<boolean>(false);
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
      const id = params.get('id');

      if (id === 'new') {
        this.draftId.set(null); // ← this means "we're making a new draft"
      } else {
        this.draftId.set(id);
        id && this.loadDraft(id);
      }
    });
  }

  public onContentChanged(event: any) {
    this.dirty.set(true);
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
      this.currentSuggestion.set(null);
      this.editorDisabled.set(false);
    }
  }
  // Send only the selected text for analysis
  public analyzeSelectedText() {
    if (!this.selectedText() || !this.selectedRange()) return;
    this.editorDisabled.set(true);
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
    quill.insertText(start, replacement.suggestion);
    // Move cursor to the end of the inserted suggestion
    quill.setSelection(start + replacement.suggestion.length, 0);

    // Remove green highlight after 2 seconds
    setTimeout(() => {
      quill.formatText(start, replacement.length ?? 0, { background: false });
    }, 2000);

    // Reset selection state
    this.resetEditor();
  }

  // Decline the suggestion (just clears the UI)
  public declineSuggestion() {
    this.resetEditor();
  }

  public resetEditor(): void {
    this.selectedText.set(null);
    this.currentSuggestion.set(null);
    this.selectedRange.set(null);
    this.editorDisabled.set(false);
  }
  // Save Current Draft

  saveCurrentDraft() {
    const id = this.draftId();
    const title = this.currDraft()?.title ?? this.draftTitle(); // Use tracked title for new drafts
    const content = this.editorContent();

    if (!title || title.trim() === '') {
      const dialogRef = this.dialog.open(TitleDialogComponent, {
        data: { title: this.draftTitle() || 'Untitled Draft' }, // Show current title or placeholder
      });

      dialogRef.afterClosed().subscribe((newTitle) => {
        if (newTitle) {
          this.draftTitle.set(newTitle); // Update the title locally
          console.log(id);
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
    if (draftId !== 'new') {
      this.draftService.getDraftById(draftId).subscribe({
        next: (draft) => {
          this.editorContent.set(draft.content);
          const quill = this.editor()?.quillEditor;
          if (quill) quill.root.innerHTML = draft.content;
        },
        error: (error) => console.error('Error loading draft:', error),
      });
    }
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

  updateTitle(newTitle: string): void {
    if (this.draftId()) {
      // If it's an existing draft, update the title
      this.draftService.editDraftTitle(this.draftId()!, newTitle);
    } else {
      // If it's a new draft, just update the local title signal
      this.draftTitle.set(newTitle);
    }
    this.titleEditOpen.set(false);
  }
  exportToPDF(): void {
    this.downloadService.exportToPDF(
      this.editor()!,
      this.currDraft()?.title ?? 'Draft'
    );
  }
}
