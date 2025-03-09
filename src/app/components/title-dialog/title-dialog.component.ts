import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-title-dialog',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatInputModule, MatDialogModule],
  templateUrl: './title-dialog.component.html',
  styleUrls: ['./title-dialog.component.scss'],
})
export class TitleDialogComponent {
  title: string = '';

  constructor(
    public dialogRef: MatDialogRef<TitleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string }
  ) {
    this.title = data.title;
  }

  save() {
    this.dialogRef.close(this.title);
  }
}
