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

  generateImage(description: string): Observable<{ data: { url: string }[] }> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${environment.images}`,
    });

    const payload = {
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that creates character illustrations.',
        },
        {
          role: 'user',
          content: `Create a full-body concept art image of ${description}.`,
        },
      ],
      tools: [
        {
          type: 'image_generation',
          tool_spec: {
            image_model: 'dall-e-3',
            image_size: '1024x1024',
            image_count: 1,
          },
        },
      ],
      tool_choice: { type: 'image_generation' },
    };

    return this.http.post<{ data: { url: string }[] }>(
      'https://api.openai.com/v1/images/generations',
      {
        prompt: `A highly detailed, realistic image of ${description}, inspired by professional character concept art. 
          Rendered in ultra-high quality with soft shading, intricate details, and cinematic lighting. Vibrant colors, realistic textures, 
          and expressive facial features. No abstract or distorted elements.`,
        n: 1,
        size: '1024x1024',
        model: 'dall-e-3', // ✅ Explicitly use DALL·E 3
      },
      { headers }
    );
  }
}
