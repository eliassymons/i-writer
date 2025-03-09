import { computed, Injectable, signal } from '@angular/core';
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
  public currentDraft = computed(() => {
    return this.drafts().find((d) => d.id === this.draftId());
  });
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

  updateDraft(id: string, title: string, content: string): void {
    const draftToUpdate = this.drafts().find((draft) => draft.id === id);
    if (!draftToUpdate) return;

    const updatedDraft = {
      ...draftToUpdate,
      title,
      content,
      timestamp: new Date().toISOString(),
    };

    // Send update to MockAPI
    this.http.put<Draft>(`${this.API_URL}/${id}`, updatedDraft).subscribe({
      next: () => {
        // Update local state
        this.drafts.update((drafts) =>
          drafts.map((draft) => (draft.id === id ? updatedDraft : draft))
        );
      },
      error: (error) => console.error('Error updating draft:', error),
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
    console.log(title);
    const draftToUpdate = this.drafts().find((draft) => draft.id === id);
    if (!draftToUpdate) {
      console.error(`Draft with ID ${id} not found.`);
      return;
    }

    const updatedDraft = { ...draftToUpdate, title };

    // Send update request to MockAPI
    this.http.put<Draft>(`${this.API_URL}/${id}`, updatedDraft).subscribe({
      next: (updatedDraftFromAPI) => {
        // Update local state
        this.drafts.update((drafts) =>
          drafts.map((draft) => (draft.id === id ? updatedDraftFromAPI : draft))
        );
        console.log(`Draft ${id} updated successfully:`, updatedDraftFromAPI);
      },
      error: (error) => console.error('Error updating draft title:', error),
    });
  }
}
