import { inject, Injectable, signal } from '@angular/core';
import { Tache } from '../model/tache.model';
import { CategorieService } from './categorie.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenageService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/menage`;

  menages = signal<Tache[]>([]) 

    getAll(): Observable<Tache[]> {
    return this.http.get<Tache[]>(this.apiUrl);
  }



}
