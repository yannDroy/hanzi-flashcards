import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FlashcardsComponent } from './flashcards/flashcards.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FlashcardsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  /** App title */
  title:string = "Hanzi Flashcards";


  /**
   * Constructor
   */
  constructor() {}
}
