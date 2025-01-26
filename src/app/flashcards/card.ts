/** Enumeration of the Mandarin tones */
enum Tone {
  Neutral, First, Second, Third, Fourth
}

/** List of potential vowels for each Mandarin tone */
const FIRST_TONE_VOWELS = ['ā', 'ē', 'ī', 'ū', 'ǖ', 'ō'];
const SECOND_TONE_VOWELS = ['á', 'é', 'í', 'ú', 'ǘ', 'ó'];
const THIRD_TONE_VOWELS = ['ǎ', 'ě', 'ǐ', 'ǔ', 'ǚ', 'ǒ'];
const FOURTH_TONE_VOWELS = ['à', 'è', 'ì', 'ù', 'ǜ', 'ò'];

/**
 * Class that represents a flashcard in the application
 */
export class Card {
  /** The Hanzi */
  hanzi:string = "";

  /** The Pinyin */
  pinyin:string = "";

  /** The English translation */
  english:string = "";

  /** Description (containing more information and/or example words) */
  description:string = "";

  /**
   * Constructor
   * @param hanzi The Hanzi
   * @param pinyin The Pinyin
   * @param english The English translation
   * @param description The description
   */
  constructor(hanzi:string,
              pinyin:string,
              english:string,
              description:string) {
    this.hanzi = hanzi;
    this.pinyin = pinyin;
    this.english = english;
    this.description = description;
  };

  /**
   * Returns true if the card has a description, false otherwise
   * @returns boolean
   */
  hasDescription():boolean {
    return this.description.length > 0;
  }

  /**
   * Returns true if the card has an English description, false otherwise
   * @returns boolean
   */
  hasEnglish():boolean {
    return this.english.length > 0;
  }

  /**
   * Returns the css class for the tone
   * @returns string
   */
  toneClass():string {
    if (FIRST_TONE_VOWELS.some(vowel => this.pinyin.includes(vowel))) {
      return 'tone-1';
    } else if (SECOND_TONE_VOWELS.some(vowel => this.pinyin.includes(vowel))) {
      return 'tone-2';
    } else if (THIRD_TONE_VOWELS.some(vowel => this.pinyin.includes(vowel))) {
      return 'tone-3';
    } else if (FOURTH_TONE_VOWELS.some(vowel => this.pinyin.includes(vowel))) {
      return 'tone-4';
    } else {
      return 'tone-0';
    }
  }
}
