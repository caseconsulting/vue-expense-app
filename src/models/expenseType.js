import { Category } from '@/models/category.js';
export class ExpenseType {
  constructor(properties) {
    /** @type {string} */
    this.id = properties.id;
    /** @type {string[]} */
    this.accessibleBy = properties.accessibleBy;
    /** @type {boolean} */
    this.alwaysOnFeed = properties.alwaysOnFeed;
    /** @type {number} */
    this.budget = properties.budget;
    /** @type {string} */
    this.budgetName = properties.budgetName;
    /** @type {string} */
    this.campfire = properties.campfire;
    /** @type {Category[]} */
    let categories = properties.categories ?? [];
    this.categories = categories.map((c) => new Category(c));
    /** @type {string} */
    this.description = properties.description;
    /** @type {string} */
    this.endDate = properties.endDate;
    /** @type {boolean} */
    this.hasRecipient = properties.hasRecipient;
    /** @type {boolean} */
    this.isInactive = properties.isInactive;
    /** @type {boolean} */
    this.odFlag = properties.odFlag;
    /** @type {boolean} */
    this.proRated = properties.proRated;
    /** @type {boolean} */
    this.recurringFlag = properties.recurringFlag;
    /** @type {boolean} */
    this.requiredFlag = properties.requiredFlag;
    /** @type {boolean} */
    this.requireURL = properties.requireURL;
    /** @type {string} */
    this.startDate = properties.startDate;
    /** @type {Object[]} */
    this.tagBudgets = properties.tagBudgets;
  }

  get categoriesOnFeed() {
    let categoriesOnFeed = this.categories.filter((c) => c.showOnFeed);
    return categoriesOnFeed.length > 0 ? categoriesOnFeed.map((c) => c.name).join(', ') : 'None';
  }

  get categoriesRequireReceipt() {
    let categoriesRequireReceipt = this.categories.filter((c) => c.requireReceipt);
    return categoriesRequireReceipt.length > 0 ? categoriesRequireReceipt.map((c) => c.name).join(', ') : 'None';
  }

  get categoriesRequireURL() {
    let categoriesRequireURL = this.categories.filter((c) => c.requireURL);
    return categoriesRequireURL.length > 0 ? categoriesRequireURL.map((c) => c.name).join(', ') : 'None';
  }
}