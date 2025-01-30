import { Component, Input } from "@angular/core";

/** File paths */
const SWOOSH_SOUND_PATH = "../../assets/sounds/swoosh.mp3";
const FLIP_SOUND_PATH = "../../assets/sounds/flip.mp3";

/** Delay to play the flip sound */
const DELAY_FLIP_SOUND = 80;


/**
 * Class that handles the sounds on the page
 */
export class Sounds {
  /** Swoosh sound (next card) */
  swooshSound = new Audio();

  /** Flip sound (flip card) */
  flipSound = new Audio();


  /**
   * Constructor
   */
  constructor(mobile:boolean) {
    // Load the sounds
    this.swooshSound.src = SWOOSH_SOUND_PATH;
    this.flipSound.src = FLIP_SOUND_PATH;
    this.swooshSound.volume = 0.2;
    this.flipSound.volume = 0.2;
    this.swooshSound.load();
    this.flipSound.load();

    console.debug("--- Sounds constructor: sounds are loaded");
  }

  /**
   * Play the swoosh sound
   */
  playSwooshSound() {
    try {
      this.swooshSound.play();
    } catch(exception:any) {
      console.warn(exception);
    }
  }

  /**
   * Play the flip sound
   */
  playFlipSound() {
    setTimeout(() => {
      try {
        this.flipSound.play();
      } catch(exception:any) {
        console.warn(exception);
      }
    }, DELAY_FLIP_SOUND); // needs to match the duration in .css
  }
}
