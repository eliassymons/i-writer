import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Character {
  id?: string;
  name: string;
  age: number;
  gender: string;
  appearance: string;
  personality: string;
  backstory: string;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  private API_URL = environment.charactersKey;

  constructor(private http: HttpClient) {}

  saveCharacter(character: Character): Observable<Character> {
    return this.http.post<Character>(this.API_URL, character);
  }

  getCharacters(): Observable<Character[]> {
    return this.http.get<Character[]>(this.API_URL);
  }

  getCharacterById(id: string): Observable<Character> {
    return this.http.get<Character>(`${this.API_URL}/${id}`);
  }

  updateCharacter(
    id: string,
    updatedData: Partial<Character>
  ): Observable<Character> {
    return this.http.put<Character>(`${this.API_URL}/${id}`, updatedData);
  }

  deleteCharacter(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
