import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'

import { Card } from './card';
import { Animations } from '../animations/animations';
import { Sounds } from '../sounds/sounds';

import itemsFile from '../../assets/items.json';


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
  sounds:Sounds | undefined;

  /** Boolean indicating the user is on mobile */
  mobile:boolean;

  /** List of all the cards */
  cards:Array<Card> = [];

  /** Sets of indexes */
  sets:Array<Array<number>> = [];

  /** Index of the current card being displayed */
  cardIndex:number = -1;

  /** Index of current set being used */
  setIndex:number = -1;

  /** Boolean indicating the current set of cards has been entirely viewed */
  finishedSet:boolean = false;

  /** Boolean indicating the current card has been flipped */
  flipped:boolean = false;
  

  /**
   * Constructor
   */
  constructor() {
    this.mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    this.animations = new Animations(this.mobile);
    this.sounds = this.mobile ? undefined : new Sounds(this.mobile);

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

    console.debug("--- FlashcardsComponent constructor: total number of cards: " + this.cards.length);
    console.debug("--- FlashcardsComponent constructor: mobile = " + this.mobile);

    this.generateSets();
    this.init(true);
  }

  /**
   * Generate the sets of cards
   */
  generateSets() {
    const random = this.seed();

    const all:Array<number> = [];
    for (let i = 0; i < FlashcardsComponent.NUMBER_OF_SETS; i++) {
      const set:Array<number> = [];
      while (set.length < FlashcardsComponent.NUMBER_OF_CARDS) {
        const index = Math.floor(random() * this.cards.length);
        if (!set.includes(index) && !all.includes(index)) {
          set.push(index);
          all.push(index);
        }
      }
      this.sets.push(set);
    }
  }

  /**
   * Init the current set
   */
  init(firstInit:boolean):void {
    if (this.animations.isAnimationOngoing()) {
      return;
    }

    this.setIndex = this.setIndex != -1 ? ((this.setIndex + 1) % FlashcardsComponent.NUMBER_OF_SETS) : 0;
    this.cardIndex = 0;
    this.finishedSet = false;
    this.flipped = false;

    console.debug("--- init: setIndex    = " + this.setIndex);
    console.debug("--- init: cardIndex   = " + this.cardIndex);
    console.debug("--- init: finishedSet = " + this.finishedSet);
    // console.debug("--- init: index from all items = " + this.sets[this.setIndex][this.cardIndex]);

    this.animations.replaceAnimation();
    !firstInit && this.sounds?.playSwooshSound();
  }

  /**
   * Replace the current card with the next one
   */
  nextCard():void {
    if (this.animations.isAnimationOngoing()) {
      return;
    }

    this.flipped = false;
    this.cardIndex = (this.cardIndex + 1) % FlashcardsComponent.NUMBER_OF_CARDS;
    this.finishedSet = this.finishedSet || ((this.cardIndex + 1) % FlashcardsComponent.NUMBER_OF_CARDS == 0);

    console.debug("--- nextCard: cardIndex   = " + this.cardIndex);
    console.debug("--- nextCard: finishedSet = " + this.finishedSet);
    // console.debug("--- nextCard: index from all items = " + this.sets[this.setIndex][this.cardIndex]);

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
      this.animations.mouseEnter(event, this.flipped);
    } else {
      this.flipCard();
    }
  }

  /**
   * Returns the text to display on the new set button
   * @returns string
   */
  newSetButtonText():string {
    if (this.setIndex == FlashcardsComponent.NUMBER_OF_SETS - 2) {
      return "_Łạṧț·ʂɛẗ";
    }
    if (this.setIndex == FlashcardsComponent.NUMBER_OF_SETS - 1) {
      return "$ȶἆřŧ-ʘὗϵɼ";
    }

    return "New set";
  }

  /**
   * Returns the text to display on the next card button
   * @returns string
   */
  nextCardButtonText():string {
    if (this.setIndex == FlashcardsComponent.NUMBER_OF_SETS - 1) {
      return "₦ḝϰ†‾ҫἁɼɖ…";
    }

    return "Next card";
  }

  /**
   * Returns a function to initialize the random seed
   * @param date today's date
   * @returns function
   */
  seed(date:Date = new Date()): () => number {
    let seed = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    return function() {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
  }

  /**
   * Returns the number of cards in a set
   * @returns number
   */
  getNumberOfCards():number {
    return FlashcardsComponent.NUMBER_OF_CARDS;
  }

  /**
   * Returns the current date as a string
   * @returns string
   */
  getDate():string {
    return new Date().toLocaleDateString();
  }
}
