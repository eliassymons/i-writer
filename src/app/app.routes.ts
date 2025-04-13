import { Routes } from '@angular/router';
import { EditorComponent } from './pages/editor/editor.component';
import { DraftListComponent } from './components/draft-list/draft-list.component';
import { AboutComponent } from './pages/about/about.component';
import { CharacterDesignerComponent } from './pages/character-designer/character-designer.component';
import { CharacterListComponent } from './pages/character-list/character-list.component';

export const routes: Routes = [
  { path: '', component: DraftListComponent }, // Default page (Draft List)
  { path: 'editor', component: DraftListComponent }, // New draft
  { path: 'editor/:id', component: EditorComponent }, // Edit existing draft
  { path: 'about', component: AboutComponent },
  { path: 'characters', component: CharacterListComponent }, // ✅ Character landing page
  { path: 'characters/new', component: CharacterDesignerComponent }, // ✅ New character
  { path: 'characters/:id', component: CharacterDesignerComponent }, // ✅ Edit existing character
  { path: '**', redirectTo: '' }, // Catch-all redirects to DraftListComponent
];
