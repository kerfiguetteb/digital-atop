import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
  inject,
  signal,
} from '@angular/core';
import { MenageService } from './services/menage.service';
import { CardComponent } from './components/card/card.component';
import { AffichageComponent } from './components/affichage/affichage.component';
import { Tache } from './model/tache.model';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CardComponent, AffichageComponent, NgClass],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  private menageService = inject(MenageService);

   isTransitioning = signal(false);
  
  // Méthode à appeler lors du changement d'image
  changeImage() {
    this.isTransitioning.set(true);
    
    setTimeout(() => {
      // Changer l'index ici
      this.activeIndex.update(i => i + 1);
      
      setTimeout(() => {
        this.isTransitioning.set(false);
      }, 50);
    }, 350); // La moitié de la durée de transition
  }

  menages = signal<any[]>([]);
  affiches = signal<Tache[]>([]);
  video = signal<Tache[]>([]);

  @ViewChildren('card', { read: ElementRef })
  cards!: QueryList<ElementRef<HTMLElement>>;

  // Configuration de la grille
  readonly COLS = 5; // Nombre de colonnes par rangée (avec le bouton Play)

  // Navigation
  activeRow = signal(0);
  activeIndex = signal(0); // -1 = bouton Play, 0+ = cards
  selected = signal<any | null>(null);

  // Carrousel plein écran
  private carouselInterval: any = null;
  carouselFullscreen = signal<boolean>(false);
  private carouselRow = signal<number | null>(null);

  // Nombre total de rangées
  private get totalRows(): number {
    let count = 0;
    if (this.menages().length > 0) count++;
    if (this.affiches().length > 0) count++;
    if (this.video().length > 0) count++;
    return count;
  }

  // Vérifie si le carrousel est actif pour une rangée
  carouselActive(row: number): boolean {
    return this.carouselFullscreen() && this.carouselRow() === row;
  }

  // Obtient les données de la rangée active
  private getRowData(row: number): any[] {
    if (row === 0) return this.menages();
    if (row === 1) return this.affiches();
    if (row === 2) return this.video();
    return [];
  }

  // Obtient la longueur de la rangée (avec +1 pour le bouton Play)
  private getRowLength(row: number): number {
    return this.getRowData(row).length + 1; // +1 pour le bouton Play
  }

  ngOnInit(): void {
    this.menageService.getAll().subscribe((data) => {
      this.menages.set(data ?? []);
      queueMicrotask(() => this.focusFirstIfNeeded());
    });

    // Charge les affiches
    setTimeout(() => {
      this.affiches.set([
        {tastId:5, username:'', taskNom:"atop", imgUrl:"img/atop.png"},
        {tastId:7, username:'', taskNom:"sandra", imgUrl:"img/Sandra_TV.png"},
        {tastId:8, username:'', taskNom:"levains", imgUrl:"img/Levains.png"},
      ]);
    }, 500);

    setTimeout(() => {
      this.video.set([
        {tastId:9, username:'', taskNom:"atop", imgUrl:"img/Atop.mp4"},
      ]);
    }, 500);
  }

  ngAfterViewInit(): void {
    this.cards.changes.subscribe(() => this.focusFirstIfNeeded());
    queueMicrotask(() => this.focusFirstIfNeeded());
  }

  ngOnDestroy(): void {
    // Nettoie l'intervalle du carrousel
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  // Démarre le carrousel en plein écran
  startCarouselFullscreen(row: number) {
    this.carouselFullscreen.set(true);
    this.carouselRow.set(row);
    
    const rowData = this.getRowData(row);
    let currentIndex = 0;
    
    // Démarre sur la première image
    this.activeIndex.set(currentIndex);
    
    // Change d'image toutes les 3 secondes
    this.carouselInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % rowData.length;
      this.activeIndex.set(currentIndex);
    }, 3000);
  }

  // Arrête le carrousel plein écran
  stopCarouselFullscreen() {
    this.carouselFullscreen.set(false);
    this.carouselRow.set(null);
    
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
      this.carouselInterval = null;
    }
  }

  // Quand on sélectionne la card Play
  onPlayCardSelected(row: number) {
    this.startCarouselFullscreen(row);
  }

  openPanel(item: any) {
    this.selected.set(item);
    console.log(this.selected());
  }

  closePanel() {
    this.selected.set(null);
    
    // Si on ferme le carrousel plein écran
    if (this.carouselFullscreen()) {
      this.stopCarouselFullscreen();
    }
    
    queueMicrotask(() => this.focusCurrentCard());
  }

  private focusFirstIfNeeded() {
    if (!this.cards || this.cards.length === 0) return;
    const ae = document.activeElement as HTMLElement | null;
    if (ae && ae !== document.body) return;

    // Met à jour l'état d'abord
    this.activeRow.set(0);
    this.activeIndex.set(-1); // Focus sur le bouton Play
    
    // Petit délai pour que Angular mette à jour le tabIndex
    setTimeout(() => {
      const playButtonIndex = this.getGlobalIndex(0, -1);
      const playButton = this.cards.get(playButtonIndex)?.nativeElement;
      if (playButton) {
        playButton.focus();
      }
    }, 0);
  }

  private focusCurrentCard() {
    const globalIndex = this.getGlobalIndex(this.activeRow(), this.activeIndex());
    this.cards.get(globalIndex)?.nativeElement.focus();
  }

  // Convertit (row, index) en index global dans QueryList
  private getGlobalIndex(row: number, index: number): number {
    let globalIndex = 0;

    if (row === 0) {
      globalIndex = index + 1; // +1 pour le bouton Play
    } else if (row === 1) {
      // Nombre total d'éléments de la rangée 0 (bouton + cards)
      globalIndex = (this.menages().length + 1) + (index + 1);
    }else if (row === 2) {
    globalIndex =
      (this.menages().length + 1) +
      (this.affiches().length + 1) +
      (index + 1);
  }

    return globalIndex;
  }
  private isBackEvent(e: KeyboardEvent): boolean {
  // Fire TV / Android: KEYCODE_BACK = 4 (parfois exposé)
  const anyE = e as any;
  return (
    e.key === 'Escape' ||
    e.key === 'Backspace' ||
    e.key === 'GoBack' ||
    e.key === 'BrowserBack' ||
    e.code === 'Escape' ||
    anyE.keyCode === 4 ||
    anyE.which === 4 
  );
}


  @HostListener('window:keydown', ['$event'])
  onWindowKeydown(e: KeyboardEvent) {
    console.log(e.key);
    
    // Si carrousel plein écran : Escape/Backspace ferme
    if (this.isBackEvent(e) || e.key === 'ArrowDown') {
      e.preventDefault();
      this.closePanel();
    }
    
    // Si popup ouverte
if (this.isBackEvent(e)) {
  e.preventDefault();
  this.stopCarouselFullscreen();
}

    // Navigation
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      return;
    }

    e.preventDefault();

    let newRow = this.activeRow();
    let newIndex = this.activeIndex();
    const currentRowLength = this.getRowLength(newRow);

    // Calcule la position actuelle en ligne/colonne (avec -1 pour le bouton Play)
    const adjustedIndex = newIndex + 1; // Ajuste pour le calcul (0 = bouton, 1+ = cards)
    const currentRow = Math.floor(adjustedIndex / this.COLS);
    const currentCol = adjustedIndex % this.COLS;

    switch (e.key) {
      case 'ArrowRight':
        newIndex++;
        // L'index va de -1 à (nombre de cards - 1)
        // Ex: PlayCard(-1), Card0(0), Card1(1), ... Card4(4)
        const maxIndex = this.getRowData(newRow).length - 1;
        if (newIndex > maxIndex) {
          newIndex = maxIndex; // Bloque à la dernière card
        }
        break;

      case 'ArrowLeft':
        newIndex--;
        if (newIndex < -1) {
          newIndex = -1; // Bloque au bouton Play
        }
        break;

      case 'ArrowDown':
        // Vérifie s'il y a une ligne en dessous dans la même rangée
        const nextLineIndex = adjustedIndex + this.COLS;
        
        if (nextLineIndex < currentRowLength) {
          // Reste dans la même rangée, descend d'une ligne
          newIndex = nextLineIndex - 1;
        } else {
          // Change de rangée (section)
          newRow++;
          if (newRow >= this.totalRows) {
            newRow = this.totalRows - 1;
          } else {
            // Essaie de garder la même colonne
            const nextRowLength = this.getRowLength(newRow);
            newIndex = Math.min(currentCol - 1, nextRowLength - 2);
          }
        }
        break;

      case 'ArrowUp':
        // Vérifie s'il y a une ligne au-dessus dans la même rangée
        const prevLineIndex = adjustedIndex - this.COLS;
        
        if (prevLineIndex >= 0) {
          // Reste dans la même rangée, monte d'une ligne
          newIndex = prevLineIndex - 1;
        } else {
          // Change de rangée (section)
          newRow--;
          if (newRow < 0) {
            newRow = 0;
          } else {
            // Va à la dernière ligne de la rangée précédente, même colonne
            const prevRowLength = this.getRowLength(newRow);
            const lastLineStart = Math.floor((prevRowLength - 1) / this.COLS) * this.COLS;
            newIndex = Math.min(lastLineStart + currentCol - 1, prevRowLength - 2);
          }
        }
        break;
    }

   


    // Met à jour
    this.activeRow.set(newRow);
    this.activeIndex.set(newIndex);
    this.focusCurrentCard();
  }

         visible = signal(true);

 hidden(){
      setTimeout(() => {
        this.visible.set(false)
      }, 3000);
      return this.visible()
    }
  // Calcule le translateY pour positionner la rangée active
  getRowsTranslateY(): number {
    const ROW_HEIGHT = 380;
    return -(this.activeRow() * ROW_HEIGHT);
  }
}