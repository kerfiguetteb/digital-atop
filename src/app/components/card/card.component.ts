import { Component, HostBinding, HostListener, input, output } from '@angular/core';
import { Tache } from '../../model/tache.model';

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
})
export class CardComponent {
  tabIndex = input<number>(-1); // ❌ Changé de 1 à -1 par défaut
  active = input<boolean>(false);
  data = input<Tache>({} as Tache);
  type = input<string>(''); // 'play' ou ''
  
  focused = output<void>();
  selected = output<Tache | null>(); // ❌ Ajouté | null pour le type play
  
  // Focusable
  @HostBinding('attr.tabindex')
  get hostTabIndex() {
    return this.tabIndex();
  }
  
  @HostBinding('attr.role')
  role = 'button';
  
  // Style + focus visible TV
  @HostBinding('class')
  get hostClass() {
    return [
      'block rounded-xl overflow-hidden cursor-pointer outline-none transition-all duration-300', // ❌ Ajouté transition
      'focus:ring-4 focus:ring-blue-500/60 focus:scale-105',
      this.active() ? 'ring-4 ring-blue-400/80 scale-105' : 'ring-0 scale-100',
    ].join(' ');
  }
  
  @HostListener('focus')
  onFocus() {
    this.focused.emit();
  }
  
  // OK / Enter / Space / Center
  @HostListener('keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if (['Enter', ' ', 'Center'].includes(e.key)) {
      e.preventDefault();
      // ❌ Pour le type 'play', on émet null
      if (this.type() === 'play') {
        this.selected.emit(null);
      } else {
        this.selected.emit(this.data());
      }
    }
  }
  
  // Click souris
  @HostListener('click')
  onClick() {
    // ❌ Pour le type 'play', on émet null
    if (this.type() === 'play') {
      this.selected.emit(null);
    } else {
      this.selected.emit(this.data());
    }
  }
}