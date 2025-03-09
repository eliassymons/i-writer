import { Routes } from '@angular/router';
import { EditorComponent } from './pages/editor/editor.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { DraftListComponent } from './components/draft-list/draft-list.component';
import { AboutComponent } from './pages/about/about.component';

export const routes: Routes = [
  { path: '', component: DraftListComponent }, // Default page (Draft List)
  { path: 'editor', component: EditorComponent }, // New draft
  { path: 'editor/:id', component: EditorComponent }, // Edit existing draft
  { path: 'about', component: AboutComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: '' }, // Catch-all redirects to DraftListComponent
];
