import { Routes } from '@angular/router';
import { WorkListComponent } from './features/work-list/work-list.component';
import { WorkViewComponent } from './features/work-view/work-view.component';

export const routes: Routes = [
  { path: 'works', component: WorkListComponent },
  { path: 'works/:id', component: WorkViewComponent },
  { path: '', redirectTo: 'works', pathMatch: 'full' },
];
