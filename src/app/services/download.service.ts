import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QuillEditorComponent } from 'ngx-quill';

@Injectable({
  providedIn: 'root',
})
export class DownloadService {
  async exportToPDF(editor: QuillEditorComponent, title: string) {
    const quillElement = editor?.quillEditor.root;
    if (!quillElement) return;

    const scale = 2; // Increase resolution for better clarity

    const canvas = await html2canvas(quillElement, {
      scale, // Improves text clarity
      useCORS: true, // Prevents cross-origin issues
      backgroundColor: '#ffffff', // Ensures white background
    });

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth - 20; // Add margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio

    pdf.addImage(
      imgData,
      'PNG',
      10,
      10,
      imgWidth,
      imgHeight,
      undefined,
      'FAST'
    );
    pdf.save(`${title}.pdf`);
  }
  constructor() {}
}
