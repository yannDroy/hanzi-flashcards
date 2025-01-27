import { Card } from "./card";

/** Enumeration of data types for each items in the .json file */
enum Type {
  Hanzi, Pinyin, Engligh, Description, None
}

/** Animation durations */
const DURATION_FLIP_ANIMATION = 800;
const DURATION_REPLACE_ANIMATION = 200;

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

  /** Boolean that indicates if the new card is replacing the old */
  replace:boolean = false;

  /** Boolean that indicates if the card is being flipped (information being displayed) */
  flip:boolean = false;

  /**
   * Constructor
   * @param itemsFile content of src/assets/items.json
   */
  constructor(itemsFile: Array<Array<string>>) {
    console.debug("--- Flashcards constructor: BEGIN");

    // Loop through each item in the .json file
    for (let i:number = 0; i < itemsFile.length; i++) {
      console.debug("------ Flashcards constructor: processsing " + itemsFile[i]);

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

    console.debug("--- Flashcards constructor: number of cards: " + this.cards.length);

    console.debug("--- Flashcards constructor: END");
  }

  /**
   * Returns true if the Hanzi information is shown, false otherwise
   * @returns boolean
   */
  isInfoShown():boolean {
    return this.infoIsShown;
  }

  /**
   * Returns true if the new card is replacing the old one
   * @returns boolean
   */
  isReplacing():boolean {
    return this.replace;
  }

  /**
   * Returns true if there is an animation ongoing
   * @returns boolean
   */
  isAnimationOngoing():boolean {
    if (this.flip || this.replace) {
      console.debug("--- Check animation: animation ongoing");
      return true;
    }

    return false;
  }

  /**
   * Start the replacement animation with the new card
   */
  nextCard():void {
    // Return immediately if there already is an ongoing animation
    if (this.isAnimationOngoing()) {
      return;
    }

    this.index = (this.index + 1) % this.cards.length;
    console.debug("--- Next card: index: " + this.index);

    this.replace = true;
    console.debug("--- Next card: replace: " + this.replace);

    // Set a timer for the animation class
    setTimeout(() => {
      // Replacement is finished
      this.replace = false;
      console.debug("--- Next card: stop, replace: " + this.replace);

      this.infoIsShown = false;
      console.debug("--- Next card: infoIsShown: " + this.infoIsShown);
    }, DURATION_REPLACE_ANIMATION); // needs to match the duration in .css
  }

  /**
   * Start the flip animation and display the card information
   */
  showInformation():void {
    // Return immediately if there already is an ongoing animation
    if (this.isAnimationOngoing()) {
      return;
    }

    this.flip = true;
    console.debug("--- Show information: start, flip: " + this.flip);

    // Set the infoIsShown flag to true
    this.infoIsShown = true;
    console.debug("--- Show information: stop, infoIsShown: " + this.infoIsShown);

    // Set a timer to reset the flip attribute
    setTimeout(() => {
      // Flip is finished
      this.flip = false;
      console.debug("--- Show information: stop, flip: " + this.flip);
    }, DURATION_FLIP_ANIMATION); // needs to match the duration in .css
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