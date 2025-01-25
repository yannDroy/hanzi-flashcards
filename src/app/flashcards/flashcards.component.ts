import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'
import { Flashcards } from './flashcards';

import itemsFile from '../../assets/items.json';

@Component({
  selector: 'app-flashcards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flashcards.component.html',
  styleUrl: './flashcards.component.css'
})

export class FlashcardsComponent {
  flashcards:Flashcards = new Flashcards(itemsFile.items);

  constructor(){};
}
