import { isDevMode } from "@angular/core";


/** Animation duration constants */
const DURATION_FLIP_ANIMATION = 800;
const DURATION_REPLACE_ANIMATION = 200;
const DURATION_LAST_REPLACE_ANIMATION = 1400;
const DURATION_ENTER_TILT_ANIMATION = 100;
const DURATION_LEAVE_TILT_ANIMATION = 200;

/** Reduce the tilt of the card when hovering */
const REDUCE_TILT = 3800;


/**
 * Class that handles the animations on the page
 */
export class Animations {
  /** Boolean that indicates if the new card is replacing the old */
  replace:boolean = false;

  /** Boolean that indicates if the first card of the last set is replacing the old */
  replaceLastSet:boolean = false;

  /** Boolean that indicates if the card is being flipped (information being displayed) */
  flip:boolean = false;

  /** Boolean that indicates if the mouse is over the card */
  hover:boolean = false;

  /** Boolean indicating the user is on mobile */
  mobile:boolean;


  /**
   * Constructor
   */
  constructor(mobile:boolean) {
    this.mobile = mobile;
  }

  /**
   * Flips the current card with an animation
   */
  flipAnimation():void {
    this.flip = true;

    // Set a timer to reset the flip attribute
    setTimeout(() => {
      // Flip is finished
      this.flip = false;
    }, DURATION_FLIP_ANIMATION); // needs to match the duration in .css

    document.getElementById("description")?.scrollTo(0, 0);
  }

  /**
   * Replaces the current card with an animation
   * The animation is different when the user gets to the last set
   * @param lastSet boolean
   */
  replaceAnimation(lastSet:boolean = false):void {
    if (lastSet) {
      this.lastSetReplaceAnimation();
    } else {
      this.normalSetreplaceAnimation();
    }
  }

  /**
   * Replace the current card with an animation (for any set except the last)
   */
  normalSetreplaceAnimation():void {
    this.replace = true;

    setTimeout(() => {
      this.replace = false;
    }, DURATION_REPLACE_ANIMATION); // needs to match the duration in .css

    document.getElementById("description")?.scrollTo(0, 0);
  }

  /**
   * Replaces the current card with an animation (for the last set)
   */
  lastSetReplaceAnimation():void {
    this.replaceLastSet = true;

    setTimeout(() => {
      this.replaceLastSet = false;
    }, DURATION_LAST_REPLACE_ANIMATION); // needs to match the duration in .css

    document.getElementById("description")?.scrollTo(0, 0);
  }

  /**
   * Registers that the mouse has started hovering on the card
   * Returns instantly if the card is flipped or if on mobile
   * @param event MouseEvent
   * @param flipped boolean
   */
  mouseEnter(event:MouseEvent, flipped:boolean = false):void {
    // Only process if the card has not been flipped and on desktop
    if (flipped || this.mobile) {
      return;
    }

    // Manually trigger the first tilt to have a transition
    this.mouseOver(event, false);

    this.hover = true;
  }

  /**
   * Handle the mouse movement over the card and tilt it
   * Returns instantly if the card is flipped or if on mobile
   * @param event MouseEvent
   * @param flipped boolean
   */
  mouseOver(event:MouseEvent, flipped:boolean = false):void {
    // Only process if the card has not been flipped and on desktop
    if (flipped || this.mobile || !event) {
      return;
    }

    const cardContainer:HTMLElement|null = document.getElementById("card-container");
    if (!cardContainer) {
      return;
    }

    // Coordinates of mouse click
    const mouseX:number = event.clientX;
    const mouseY:number = event.clientY;
    // Coordinates of the center of the card
    const centerX:number = cardContainer.offsetLeft + (cardContainer.offsetWidth  / 2);
    const centerY:number = cardContainer.offsetTop  + (cardContainer.offsetHeight / 2);
    // Delta
    const deltaX:number = mouseX - centerX;
    const deltaY:number = mouseY - centerY;

    let card = document.getElementById("card");
    if (card) {
      // Normalize the delta values to get the direction vector
      const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / REDUCE_TILT;
      const normX:number = deltaX / length;
      const normY:number = deltaY / length;

      card.style.transform = `rotate3d(${-normY}, ${normX}, 0, ${length}rad)`;

      // If the mouse just entered, set a transition time
      if (!this.hover) {
        card.style.transition = "transform .1s";
        setTimeout(() => {
          card.style.transition = "";
        }, DURATION_ENTER_TILT_ANIMATION); // needs to match the duration above
      }
    }
  }

  /**
   * Registers that the mouse has stopped hovering on the card
   * Returns instantly if the card is flipped or if on mobile
   * @param flipped boolean
   */
  mouseLeave(flipped:boolean = false):void {
    // Only process if the card has not been flipped and on desktop
    if (flipped || this.mobile) {
      return;
    }

    this.hover = false;

    let card = document.getElementById("card");
    if (card) {
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
   * Returns true if there is an animation ongoing
   * @returns boolean
   */
  isAnimationOngoing():boolean {
    if (this.flip || this.replace || this.replaceLastSet) {
      isDevMode() && console.debug("--- isAnimationOngoing: animation ongoing");
      return true;
    }

    return false;
  }
}
