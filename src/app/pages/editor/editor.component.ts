import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuillEditorComponent, QuillModule } from 'ngx-quill';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ApiService } from '../../services/api.service';
import { IsActiveMatchOptions } from '@angular/router';

interface ISuggestion {
  original: string;
  suggestion: string;
  start: number;
  end: number;
}

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    QuillModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent {
  private apiService = inject(ApiService);

  editor = viewChild<QuillEditorComponent>('editor');
  editorContent: string = '';
  aiResponse: string = '';
  suggestions = signal<ISuggestion[]>([]);
  constructor() {}

  saveDraft() {
    localStorage.setItem('draft', this.editorContent);
  }

  loadDraft() {
    this.editorContent = localStorage.getItem('draft') ?? ''; // Use Nullish Coalescing
  }

  onContentChanged(event: any) {
    this.editorContent = event.html; // Gets the full HTML content
  }
  analyzeText() {
    if (!this.editorContent.trim()) return;

    this.apiService
      .generateAIResponse(this.editorContent)
      .subscribe((response) => {
        console.log(response); // Debugging output

        // Extract the AI message content
        const aiMessage = response.choices[0]?.message?.content;

        if (aiMessage) {
          try {
            // Convert AI message (string) to JSON
            const parsedResponse = JSON.parse(aiMessage);

            if (parsedResponse.suggestions) {
              this.suggestions.set(parsedResponse.suggestions); // Store suggestions as array
              this.applyHighlights();
            }
          } catch (error) {
            console.error('Error parsing AI response:', error);
          }
        }
      });
  }

  applyHighlights() {
    const quill = this.editor()?.quillEditor; // Get Quill editor instance

    this.suggestions().forEach((suggestion) => {
      const startIndex = suggestion.start;
      const length = suggestion.end - suggestion.start;

      // Apply a custom highlight format
      quill?.formatText(startIndex, length, 'background', 'yellow');

      // Add a tooltip (title attribute) to display the suggestion
      const text = quill?.getText(startIndex, length);
      quill?.insertText(startIndex, text ?? '', {
        background: 'yellow',
        title: `Suggestion: ${suggestion.suggestion}`,
      });
    });
  }

  ngOnInit() {
    this.loadDraft();
  }
}
