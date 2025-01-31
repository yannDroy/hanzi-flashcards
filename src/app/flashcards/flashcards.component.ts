import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'

import { Card } from './card';
import { Animations } from '../animations/animations';
import { Sounds } from '../sounds/sounds';

import itemsFile from '../../assets/items.json';
// import itemsFile from '../../assets/items_dummy.json';


/** Enumeration of data types for each items in the .json file */
enum Type {
  Hanzi, Pinyin, Engligh, Description, None
}


@Component({
  selector: 'app-flashcards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flashcards.component.html',
  styleUrl: './flashcards.component.css'
})

export class FlashcardsComponent {
  /** Default number of cards in a set */
  static NUMBER_OF_CARDS:number = 5;

  /** Number of card sets */
  static NUMBER_OF_SETS:number = 6;

  /** Animations handler */
  animations!: Animations;

  /** Sounds handler */
  sounds:Sounds|undefined;

  /** Boolean indicating the user is on mobile */
  mobile:boolean;

  /** List of all the cards */
  cards:Array<Card> = [];

  /** Index of current set being used */
  setIndex:number = 0;

  /** Index of the current card being displayed */
  cardIndex:number = 0;

  /** Boolean indicating the current set of cards has been entirely viewed */
  finishedSet:boolean = false;

  /** Boolean indicating that the user has finished all sets and can do more */
  finishedAll:boolean = false;

  /** Boolean indicating the current card has been flipped */
  flipped:boolean = false;


  /**
   * Constructor
   */
  constructor() {
    this.mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    console.debug("--- FlashcardsComponent constructor: mobile = " + this.mobile);

    this.animations = new Animations(this.mobile);
    this.sounds = this.mobile ? undefined : new Sounds(); // No sounds on mobile

    // Loop through each item in the .json file
    for (let i:number = 0; i < itemsFile.items.length; i++) {
      this.cards.push(
        new Card(
          itemsFile.items[i][Type.Hanzi],
          itemsFile.items[i][Type.Pinyin],
          itemsFile.items[i][Type.Engligh],
          itemsFile.items[i][Type.Description]
        )
      );
    }
    // Push at least one card otherwise it crashes
    if (this.cards.length == 0) {
      this.cards.push(new Card("彦", "yàn", "", ""));
    }

    this.shuffleCards();
    this.shuffleCards();
    this.shuffleCards();

    this.init(true);
  }

  /**
   * Init a new set
   * - the set index is set to 0:
   *   - the first time
   *   - OR if init is done after all the sets are seen (start over)
   * - otherwise the set index is incremented
   *   - loops back to 0 if reached the end
   * - card index is 0 (first card of the new set)
   * - the set is not finished unless there is only one card in it
   * - the game completion is reset
   * - the current card is not flipped
   */
  init(firstInit:boolean):void {
    if (this.animations.isAnimationOngoing()) {
      return;
    }

    this.setIndex = firstInit || this.finishedAll ? 0 : ((this.setIndex + 1) % this.getNumberOfSets());
    this.cardIndex = 0;
    this.finishedSet = false || (this.getNumberOfCardsInSet() == 1);
    this.finishedAll = false;
    this.flipped = false;

    this.logAttributes("init");

    this.animations.replaceAnimation();
    !firstInit && this.sounds?.playSwooshSound();
  }

  /**
   * Replace the current card with the next one from the set
   * - current card index is incremented
   *   - loops back to 0 if reached the end
   * - the set is finished if:
   *   - it was already finished OR
   *   - we reached the last card of the set
   * - we finished all the sets if:
   *   - it was already the case OR
   *   - we finished the last of the original sets AND there are more to see (extras)
   * - the current card is not flipped
   */
  nextCard():void {
    if (this.animations.isAnimationOngoing()) {
      return;
    }

    this.cardIndex = (this.cardIndex + 1) % this.getNumberOfCardsInSet();
    this.finishedSet = this.finishedSet || ((this.cardIndex + 1) % this.getNumberOfCardsInSet() == 0);
    this.finishedAll = this.finishedAll || (this.finishedSet && this.isLastSet() && this.getNumberOfPossibleSets() > FlashcardsComponent.NUMBER_OF_SETS);
    this.flipped = false;

    this.logAttributes("nextCard");

    this.animations.replaceAnimation();
    this.sounds?.playSwooshSound();
  }

  /**
   * Init a new set after all the sets are done
   * - the set index is incremented
   *   - normally it will not loop back as the button is disabled if there are no more sets at all
   * - card index is 0 (first card of the new set)
   * - the set is not finished unless there is only one card in it
   * - the game completion stays true
   * - the current card is not flipped
   */
  moreCards():void {
    if (this.animations.isAnimationOngoing()) {
      return;
    }

    const numberOfPossibleSets = Math.ceil(this.cards.length / FlashcardsComponent.NUMBER_OF_CARDS);

    this.setIndex = (this.setIndex + 1) % numberOfPossibleSets;
    this.cardIndex = 0;
    this.finishedSet = false || (this.getNumberOfCardsInSet() == 1);
    this.finishedAll = true;
    this.flipped = false;

    this.logAttributes("moreCards");

    this.animations.replaceAnimation();
    this.sounds?.playSwooshSound();
  }

  /**
   * Flip the current card
   */
  flipCard():void {
    if (this.animations.isAnimationOngoing()) {
      return;
    }

    this.flipped = true;

    this.animations.mouseLeave(this.flipped);
    this.animations.flipAnimation();
    this.sounds?.playFlipSound();
  }

  /**
   * Handle 'tap on card' action (either next card or flip depending on its state)
   */
  tapOnCard(event:MouseEvent):void {
    if (this.flipped) {
      this.nextCard();
      // manually make the mouse enter to trigger the tilt animation
      this.animations.mouseEnter(event, this.flipped);
    } else {
      this.flipCard();
    }
  }

  /**
   * Returns a function to initialize the random seed
   * Using the date makes sure we have the same list of numbers for a given day
   * @param date Date
   * @returns function: () => number
   */
  seed(date:Date = new Date()): () => number {
    let seed = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    return function() {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
  }

  /**
   * Shuffles the cards
   */
  shuffleCards():void {
    const random = this.seed();
    const shuffledArray:Array<Card> = [];
    let length = this.cards.length;

    while (length) {
      const i:number = Math.floor(random() * length--);
      shuffledArray.push(this.cards.splice(i, 1)[0]);
    }

    this.cards = shuffledArray;
  }

  /**
   * Returns the text to display on the new set button
   * - 'Start over' if:
   *   - there is only 1 set OR
   *   - we reached the last set
   * - 'Last set' when reaching the one before last
   * - Obfuscated 'Start Over' if:
   *   - the game was finished
   *   - reaching the last set
   * - 'New set' in the other cases (regular case)
   * @returns string
   */
  newSetButtonText():string {
    if (this.getNumberOfSets() == 1) {
      return "Start over";
    }
    if (this.setIndex == this.getNumberOfSets() - 2) {
      return "Last set";
    }
    if (this.finishedAll || this.isLastSet() && this.getNumberOfSets() == FlashcardsComponent.NUMBER_OF_SETS) {
      return "$ȶἆřŧ·ʘὗϵɼ";
    }
    if (this.isLastSet()) {
      return "Start over";
    }

    return "New set";
  }

  /**
   * Returns the text to display on the next card button
   * @returns string
   */
  nextCardButtonText():string {
    // Obfuscated 'Next card' in the next set or if the game is finished
    if (this.finishedAll || this.getNumberOfSets() == FlashcardsComponent.NUMBER_OF_SETS && this.isLastSet()) {
      return "₦ḝϰ†‾ҫἁɼɖ";
    }

    return "Next card";
  }

  /**
   * Returns the text to display on the more cards button
   */
  moreButtonText():string {
    return ".ǤɨƲӭ_⹝₥€  ଲʘґ∉· ¢ἁɼƌʂ!…";
  }

  /**
   * Returns true if the user is on the last set (original ones, not counting extra)
   * @returns boolean
   */
  isLastSet():boolean {
    return this.setIndex == this.getNumberOfSets() - 1;
  }

  /**
   * Returns the number of total sets (max being NUMBER_OF_CARDS)
   * @returns number
   */
  getNumberOfSets():number {
    return this.getNumberOfPossibleSets() >= FlashcardsComponent.NUMBER_OF_SETS ? FlashcardsComponent.NUMBER_OF_SETS : this.getNumberOfPossibleSets();
  }

  /**
   * Returns the number of total possible sets with all cards
   * @returns number
   */
  getNumberOfPossibleSets():number {
    return Math.ceil(this.cards.length / FlashcardsComponent.NUMBER_OF_CARDS);
  }

  /**
   * Returns true if there are no more sets to display
   * @returns boolean
   */
  noMoreSets():boolean {
    return this.setIndex == this.getNumberOfPossibleSets() - 1;
  }

  /**
   * Returns true if the user can continue playing with extra sets
   * @returns boolean
   */
  canPlayExtra():boolean {
    return !this.noMoreSets() && this.finishedSet;
  }

  /**
   * Returns the number of cards in the current set
   * Sets have max NUMBER_OF_CARDS cards
   * By checking the index of the first card of the set + NUMBER_OF_CARDS
   * If we have not reached the end of the list, the set can have NUMBER_OF_CARDS in that set
   * Otherwise it is the remaining number until the end of the list
   * @returns number
   */
  getNumberOfCardsInSet():number {
    if ((this.setIndex * FlashcardsComponent.NUMBER_OF_CARDS) + FlashcardsComponent.NUMBER_OF_CARDS < this.cards.length) {
      return FlashcardsComponent.NUMBER_OF_CARDS;
    }

    return this.cards.length - (this.setIndex * FlashcardsComponent.NUMBER_OF_CARDS);
  }

  /**
   * Returns the current card index as a string
   * @returns number
   */
  getCurrentCardIndexAsString():string {
    // Obfuscated integer in the last set or the extra ones
    if (this.finishedAll || this.isLastSet() && this.getNumberOfSets() == FlashcardsComponent.NUMBER_OF_SETS) {
      return this.getObfuscatedNumber(this.cardIndex + 1);
    }

    return "" + (this.cardIndex + 1);
  }

  /**
   * Returns the number of cards in the current set as a string
   * @returns number
   */
  getNumberOfCardsInSetAsString():string {
    // Obfuscated integer in the last set or the extra ones
    if (this.finishedAll || (this.isLastSet() && this.getNumberOfSets() == FlashcardsComponent.NUMBER_OF_SETS)) {
      return this.getObfuscatedNumber(this.getNumberOfCardsInSet());
    }

    return "" + this.getNumberOfCardsInSet();
  }

  /**
   * Returns the current card
   * We count the number or cards times the number of completed sets + the current index in the set
   * @returns Card
   */
  getCurrentCard():Card {
    return this.cards[(this.setIndex * FlashcardsComponent.NUMBER_OF_CARDS) + this.cardIndex];
  }

  /**
   * Returns the current date as a string
   * @returns string
   */
  getDate():string {
    return new Date().toLocaleDateString();
  }

  /**
   * Returns an obfuscated version of a number
   * @param n number
   */
  getObfuscatedNumber(n:number):string {
    switch (n) {
      case 1:
        return "˥";
      case 2:
        return "ƻ";
      case 3:
        return "ʓ";
      case 4:
        return "❹";
      case 5:
        return "𐢬";
      default:
        return "" + n;
    }
  }

  /**
   * Log the class attributes with a prefix
   * @param prefix string
   */
  logAttributes(prefix:string = ""):void {
    console.debug("--- App Attributes ---");
    console.debug("--- [" + prefix + "] sets        = " + this.getNumberOfSets());
    console.debug("--- [" + prefix + "] max sets    = " + this.getNumberOfPossibleSets());
    console.debug("--- [" + prefix + "] setIndex    = " + this.setIndex);
    console.debug("--- [" + prefix + "] cardIndex   = " + this.cardIndex);
    console.debug("--- [" + prefix + "] card no.    = " + ((this.setIndex * FlashcardsComponent.NUMBER_OF_CARDS) + this.cardIndex));
    console.debug("--- [" + prefix + "] set size    = " + this.getNumberOfCardsInSet());
    console.debug("--- [" + prefix + "] all cards   = " + this.cards.length);
    console.debug("--- [" + prefix + "] finishedSet = " + this.finishedSet);
    console.debug("--- [" + prefix + "] finishedAll = " + this.finishedAll);
  }
}
