import { Component, input } from '@angular/core';

@Component({
  selector: 'app-affichage',
  imports: [],
  templateUrl: './affichage.component.html',
  styleUrl: './affichage.component.css'
})
export class AffichageComponent {

  data = input<any>()
  type = input<any>()

}
