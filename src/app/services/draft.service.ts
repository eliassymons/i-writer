import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface Draft {
  id?: string;
  title: string;
  content: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class DraftService {
  private API_URL = environment.draftsKey; // Replace with your MockAPI URL
  public drafts = signal<Draft[]>([]);
  public draftId = signal<string | null>(null);
  constructor(private http: HttpClient) {}

  // Save a new draft
  saveDraft(title: string, content: string): void {
    const newDraft: Draft = {
      title,
      content,
      timestamp: new Date().toISOString(),
    };
    this.http.post<Draft>(this.API_URL, newDraft).subscribe({
      next: (savedDraft) => {
        this.drafts.update((drafts) => [...drafts, savedDraft]); // Add to list
        alert('Draft saved successfully!');
      },
      error: (error) => console.error('Error saving draft:', error),
    });
  }

  // Get all drafts
  getDrafts(): void {
    this.http.get<Draft[]>(this.API_URL).subscribe({
      next: (loadedDrafts) => this.drafts.set(loadedDrafts),
      error: (error) => console.error('Error loading drafts:', error),
    });
  }

  // Get a single draft by ID
  getDraftById(id: string): Observable<Draft> {
    return this.http.get<Draft>(`${this.API_URL}/${id}`);
  }

  // Delete a draft
  deleteDraft(id: string): void {
    this.http.delete<void>(`${this.API_URL}/${id}`).subscribe(() => {
      this.drafts.update((drafts) => drafts.filter((d) => d.id !== id));
    });
  }

  editDraftTitle(id: string, title: string): void {
    this.drafts.update((drafts) => {
      return drafts.map((draft) =>
        draft.id === id ? { ...draft, title: title } : draft
      );
    });
  }
}
