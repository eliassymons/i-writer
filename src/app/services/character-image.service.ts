import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CharacterImageService {
  private OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

  constructor(private http: HttpClient) {}

  public generateImage(
    description: string
  ): Observable<{ data: { url: string }[] }> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${environment.images}`,
    });
    console.log(description);
    return this.http.post<{ data: { url: string }[] }>(
      'https://api.openai.com/v1/images/generations',
      {
        prompt: `A highly detailed, realistic image of ${description}, inspired by professional character concept art. 
          Rendered in ultra-high quality with soft shading, intricate details, and cinematic lighting. Vibrant colors, realistic textures, 
          and expressive facial features. No abstract or distorted elements.`,
        n: 1,
        size: '1024x1024',
        model: 'dall-e-3',
      },
      { headers }
    );
  }
}
