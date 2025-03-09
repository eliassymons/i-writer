import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-edit-title',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatInputModule],
  templateUrl: './edit-title.component.html',
  styleUrls: ['./edit-title.component.scss'],
})
export class EditTitleComponent {
  initialTitle = input<string>(''); // Modern @Input() syntax
  titleSaved = output<string>(); // Modern @Output() syntax
  cancelEdit = output<void>(); // Modern @Output() syntax

  titleControl = new FormControl('', [Validators.required]); // Reactive form control

  constructor() {
    this.titleControl.setValue(this.initialTitle()); // Initialize input value
  }

  saveTitle() {
    if (this.titleControl.valid) {
      this.titleSaved.emit(this.titleControl.value!.trim()); // Emit updated title
    }
  }

  cancel() {
    this.cancelEdit.emit();
  }
}
