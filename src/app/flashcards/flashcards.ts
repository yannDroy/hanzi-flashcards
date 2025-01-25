export class Flashcards {
    /**
     * Constructor
     * @param itemsFile content of src/assets/items.json
     */
    constructor(itemsFile: Array<Object>) {
        for (let i:number = 0; i < itemsFile.length; i++) {
            console.log(itemsFile[i]);
        }
    }
}