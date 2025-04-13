// image-upload.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  constructor(private http: HttpClient) {}

  uploadImageFromUrl(imageUrl: string): Promise<string> {
    const formData = new FormData();

    formData.append('file', imageUrl); // 🔁 Directly pass the URL here
    formData.append('upload_preset', 'unsigned_preset');
    // No need to append cloud_name here

    return this.http
      .post<any>(
        'https://api.cloudinary.com/v1_1/dzwerqgsk/image/upload',
        formData
      )
      .toPromise()
      .then((res) => res.secure_url as string);
  }
}
