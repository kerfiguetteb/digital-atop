import { Injectable, signal } from '@angular/core';
import { Categorie } from '../model/categorie.model';

@Injectable({
  providedIn: 'root'
})
export class CategorieService {
    categories = signal<Categorie[]>([
      {id:1, nom:"Ménage"}
    ])

}
