import { Card } from "./card";

/** Enumeration of data types for each items in the .json file */
enum Type {
  Hanzi, Pinyin, Engligh, Description, None
}

/**
 * Class that represents the flashcards component with its features
 */
export class Flashcards {
  /** List of all the cards */
  cards:Array<Card> = [];

  /** Index of the current flashcard */
  index:number = 0;

  /** Boolean that indicates if Hanzi information is shown (Pinyin, translation, etc.) */
  infoIsShown:boolean = false;

  /**
   * Constructor
   * @param itemsFile content of src/assets/items.json
   */
  constructor(itemsFile: Array<Array<string>>) {
    console.debug("--- Flashcards constructor: BEGIN");

    // Loop through each item in the .json file
    for (let i:number = 0; i < itemsFile.length; i++) {
      console.debug("--- Flashcards constructor: processsing " + itemsFile[i]);

      this.cards.push(
        new Card(
          itemsFile[i][Type.Hanzi],
          itemsFile[i][Type.Pinyin],
          itemsFile[i][Type.Engligh],
          itemsFile[i][Type.Description]
        )
      );
    }

    // Shuffle the cards
    this.shuffleCards();
    console.debug("--- Flashcards constructor: list of shuffled cards:");
    console.debug(this.cards);

    console.debug("--- Flashcards constructor: index: " + this.index);
    console.debug("--- Flashcards constructor: infoIsShown: " + this.infoIsShown);

    console.debug("--- Flashcards constructor: END");
  }

  /**
   * Increments the index
   */
  nextCard():void {
    this.index = (this.index + 1) % this.cards.length;
    this.infoIsShown = false;

    console.debug("--- Next card: index: " + this.index);
    console.debug("--- Next card: infoIsShown: " + this.infoIsShown);
  }

  /**
   * Toggles the boolean that controls the display of the Hanzi information
   */
  showInformation():void {
    this.infoIsShown = true;

    console.debug("--- Show information: infoIsShown: " + this.infoIsShown);
  }

  /**
   * Returns true if the Hanzi information is shown, false otherwise
   * @returns boolean
   */
  isInfoShown():boolean {
    return this.infoIsShown;
  }

  /**
   * Shuffles the array of cards
   * @param cards the array to shuffle
   * @returns a new array of the shuffled array
   */
  shuffleCards():void {
    let shuffledArray:Array<Card> = [];
    let length = this.cards.length;

    while (length) {
      let i:number = Math.floor(Math.random() * length--);
      shuffledArray.push(this.cards.splice(i, 1)[0]);
    }

    this.cards = shuffledArray;
  }
}