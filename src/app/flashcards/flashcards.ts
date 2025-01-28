import { Card } from "./card";

/** Enumeration of data types for each items in the .json file */
enum Type {
  Hanzi, Pinyin, Engligh, Description, None
}

/** Animation constants */
const DURATION_FLIP_ANIMATION = 800;
const DURATION_REPLACE_ANIMATION = 200;
const DURATION_ENTER_TILT_ANIMATION = 100;
const DURATION_LEAVE_TILT_ANIMATION = 200;
const INTERVAL_MOUSE_OVER = 10;
const REDUCE_TILT = 2500;

/** default number of cards to use */
const DEFAULT_NUMBER_OF_CARDS = 5;

/**
 * Class that represents the flashcards component with its features
 */
export class Flashcards {
  /** List of all the cards */
  cards:Array<Card> = [];

  /** Index of the current flashcard */
  index:number = 0;

  /** Number of cards to use */
  numberOfCards = DEFAULT_NUMBER_OF_CARDS;

  /** Boolean that indicates if Hanzi information is shown (Pinyin, translation, etc.) */
  infoIsShown:boolean = false;

  /** Boolean that indicates if the new card is replacing the old */
  replace:boolean = false;

  /** Boolean that indicates if the card is being flipped (information being displayed) */
  flip:boolean = false;

  /** Boolean that indicates if the mouse is over the card */
  mouseOverCard:boolean = false;

  /** Value to control the hovering times to each 10ms */
  lastMouseOver:number = -1;

  /** Boolean to check for mobile users */
  mobile:boolean = false;

  /**
   * Constructor
   * @param itemsFile content of src/assets/items.json
   */
  constructor(itemsFile: Array<Array<string>>) {
    console.debug("--- Flashcards constructor: BEGIN");

    this.mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    console.debug("------ Flashcards constructor: mobile: " + this.mobile);

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
    console.debug("--- Flashcards constructor: total number of cards: " + this.cards.length);

    this.cards = this.cards.slice(0, this.numberOfCards);

    console.debug("--- Flashcards constructor: END");
  }

  /**
   * Returns the current index
   * @returns number
   */
  getIndex():number {
    return this.index;
  }

  /**
   * Returns the number of cards
   * @returns number
   */
  getNumberOfCards():number {
    return this.numberOfCards;
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
   * Returns true if the user is on mobile
   */
  isMobile():boolean {
    return this.mobile;
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
    console.debug("--- Next card: BEGIN");

    // Return immediately if there already is an ongoing animation
    if (this.isAnimationOngoing()) {
      return;
    }

    this.infoIsShown = false;
    console.debug("------ Next card: infoIsShown: " + this.infoIsShown);

    this.index = (this.index + 1) % this.cards.length;
    console.debug("------ Next card: index: " + this.index);

    this.replace = true;
    console.debug("------ Next card: replace: " + this.replace);

    // Set a timer for the animation class
    setTimeout(() => {
      // Replacement is finished
      this.replace = false;
      console.debug("------ Next card: timer stop, replace: " + this.replace);
      console.debug("--- Next card: END");
    }, DURATION_REPLACE_ANIMATION); // needs to match the duration in .css

    // Scroll to the top of the description just in case
    document.getElementById('description')?.scrollTo(0, 0);
  }

  /**
   * Start the flip animation and display the card information
   */
  showInformation():void {
    console.debug("--- Show information: BEGIN");

    // Return immediately if there already is an ongoing animation
    if (this.isAnimationOngoing()) {
      return;
    }

    // Reset the card's position before setting infoIsShown to true
    this.mouseLeave();

    this.flip = true;
    console.debug("------ Show information: flip: " + this.flip);

    // Set the infoIsShown flag to true
    this.infoIsShown = true;
    console.debug("------ Show information: infoIsShown: " + this.infoIsShown);

    // Set a timer to reset the flip attribute
    setTimeout(() => {
      // Flip is finished
      this.flip = false;
      console.debug("------ Show information: timer stop, flip: " + this.flip);
      console.debug("--- Show information: END");
    }, DURATION_FLIP_ANIMATION); // needs to match the duration in .css

    // Scroll to the top of the description just in case
    document.getElementById("description")?.scrollTo(0, 0);
  }

  /**
   * Handle tap on card by the user (either next card or flip depending on its state)
   */
  tapOnCard(event:MouseEvent):void {
    if (this.isInfoShown()) {
      this.nextCard();
      // Manually enter the card as the mouse is on it
      this.mouseEnter(event);
    } else {
      this.showInformation();
    }
  }

  /**
   * Registers that the mouse has started hovering on the card
   */
  mouseEnter(event:MouseEvent):void {
    // Only process if the card has not been flipped and on desktop
    if (this.isInfoShown() || this.isMobile()) {
      return;
    }

    console.debug("--- Mouse enter: BEGIN");

    // Manually trigger the first tilt to have a transition
    this.mouseOver(event);

    this.mouseOverCard = true;
  }

  /**
   * Handle the mouse movement over the card and tilt it
   */
  mouseOver(event:MouseEvent):void {
    // Only process after 10ms or if the card has not been flipped or on desktop
    const now = Date.now();
    if (this.isInfoShown() ||
        this.isMobile() ||
       (this.lastMouseOver > 0 && (now - this.lastMouseOver < INTERVAL_MOUSE_OVER))) {
      return;
    }
    this.lastMouseOver = now;

    // Mouse coordinates
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    // Center of the screen coordinates
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    // Delta
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;

    let card = document.getElementById("card");
    if (card) {
      // Normalize the delta values to get the direction vector
      const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / REDUCE_TILT;
      const normX = deltaX / length;
      const normY = deltaY / length;

      // Apply the 3D rotation to the card
      card.style.transform = `rotate3d(${-normY}, ${normX}, 0, ${length}rad)`;

      // If the mouse just entered, set the transition time
      if (!this.mouseOverCard) {
        card.style.transition = "transform .1s";
        setTimeout(() => {
          card.style.transition = "";
        }, DURATION_ENTER_TILT_ANIMATION); // needs to match the duration above
      }
    }
  }

  /**
   * Registers that the mouse has stopped hovering on the card
   */
  mouseLeave():void {
    // Only process if the card has not been flipped and on desktop
    if (this.isInfoShown() || this.isMobile()) {
      return;
    }

    console.debug("--- Mouse leave: BEGIN");
    
    this.mouseOverCard = false;

    let card = document.getElementById("card");
    if (card) {
      // Reset the card's flat position with a quick transition
      card.style.transform = "rotate3d(0, 0, 0, 0rad)";
      card.style.transition = "transform .2s";
      // Clean completely the styles after the transition is done
      setTimeout(() => {
        card.style.transform = "";
        card.style.transition = "";
      }, DURATION_LEAVE_TILT_ANIMATION); // needs to match the duration above
    }
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
      const i:number = Math.floor(Math.random() * length--);
      shuffledArray.push(this.cards.splice(i, 1)[0]);
    }

    this.cards = shuffledArray;
  }
}
