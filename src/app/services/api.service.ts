import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
  private API_KEY = environment.openAiApiKey; // Get API key from environment

  constructor(private http: HttpClient) {}

  generateAIResponse(selectedText: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.API_KEY}`,
    });

    const body = {
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: `Analyze this short phrase and suggest improvements. Return only JSON in this format:
          {
            "suggestions": [
              { "original": "${selectedText}", "suggestion": "improved phrase" }
            ]
          }`,
        },
      ],
      max_tokens: 100,
    };

    return this.http.post(this.OPENAI_API_URL, body, { headers });
  }
}
