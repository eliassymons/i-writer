import { Routes } from '@angular/router';
import { EditorComponent } from './pages/editor/editor.component';
import { AnalysisComponent } from './pages/analysis/analysis.component';
import { SettingsComponent } from './pages/settings/settings.component';

export const routes: Routes = [
  { path: '', redirectTo: 'editor', pathMatch: 'full' },
  { path: 'editor', component: EditorComponent },
  { path: 'analysis', component: AnalysisComponent },
  { path: 'settings', component: SettingsComponent },
];
