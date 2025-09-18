export class Category {
  constructor(properties) {
    /** @type {string} */
    this.name = properties.name;
    /** @type {boolean} */
    this.showOnFeed = properties.showOnFeed;
    /** @type {boolean} */
    this.requireURL = properties.requireURL;
    /** @type {boolean} */
    this.requireReceipt = properties.requireReceipt;
  }
}