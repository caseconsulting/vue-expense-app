export class Category {
  constructor(properties, fromExpenseType = false) {
    /** @type {string} */
    this.cc = properties.cc;
    /** @type {string} */
    this.bcc = properties.bcc;
    /** @type {string} */
    this.name = fromExpenseType ? '' : properties.name;
    /** @type {boolean} */
    this.showOnFeed = properties.showOnFeed ?? false;
    /** @type {string} */
    this.replyTo = properties.replyTo;
    /** @type {boolean} */
    this.requireURL = properties.requireURL ?? false;
    /** @type {boolean} */
    this.requireReceipt = properties.requireReceipt ?? false;
    /** @type {string} */
    this.to = properties.to;
  }
}
