export class Category {
  constructor(properties) {
    /** @type {string} */
    this.name = properties.name;
    /** @type {boolean} */
    this.showOnFeed = properties.showOnFeed ?? false;
    /** @type {boolean} */
    this.requireURL = properties.requireURL ?? false;
    /** @type {boolean} */
    this.requireReceipt = properties.requireReceipt ?? false;
  }
}