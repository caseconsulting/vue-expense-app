import { Category } from '@/models/category.js';
export class ExpenseType {
  constructor(properties) {
    /** @type {string} */
    this.id = properties.id;
    /** @type {string[]} */
    this.accessibleBy = properties.accessibleBy ?? [];
    /** @type {boolean} */
    this.showOnFeed = properties.showOnFeed ?? false;
    /** @type {number} */
    this.budget = properties.budget;
    /** @type {string} */
    this.cc = properties.cc;
    /** @type {string} */
    this.bcc = properties.bcc;
    /** @type {string} */
    this.name = properties.name;
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
    this.hasRecipient = properties.hasRecipient ?? false;
    /** @type {boolean} */
    this.isInactive = properties.isInactive ?? false; // use active() to determine if currently active
    /** @type {string} */
    this.monthlyLimit = properties.monthlyLimit;
    /** @type {boolean} */
    this.odFlag = properties.odFlag ?? false;
    /** @type {boolean} */
    this.proRated = properties.proRated ?? false;
    /** @type {boolean} */
    this.recurringFlag = properties.recurringFlag ?? false;
    /** @type {boolean} */
    this.requireReceipt = properties.requireReceipt ?? false;
    /** @type {string} */
    this.replyTo = properties.replyTo;
    /** @type {boolean} */
    this.requireURL = properties.requireURL ?? false;
    /** @type {string} */
    this.startDate = properties.startDate;
    /** @type {Object[]} */
    this.tagBudgets = properties.tagBudgets ?? [];
    /** @type {string} */
    this.to = properties.to;
  }

  get active() {
    return this.recurringFlag ? !this.isInactive : new Date(this.endDate) >= new Date();
  }

  get accessText() {
    return this.accessibleBy.filter((accessType) => {
      return ['FullTime', 'PartTime', 'Intern', 'Custom'].includes(accessType);
    }).join(', ');
  }

  get showOnFeedText() {
    return this.showOnFeed ? 'All Expenses' : this.categoriesOnFeed;
  }

  get requireReceiptText() {
    return this.requireReceipt ? 'All Expenses' : this.categoriesRequireReceipt;
  }

  get requireURLText() {
    return this.requireURL ? 'All Expenses' : this.categoriesRequireURL;
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

  employeeAccess(employees, customAccess) {
    let employeesList = [];
    if (this.accessibleBy.includes('FullTime')) {
      // accessible by all employees
      employeesList = employeesList.concat(
        employees.filter((employee) => {
          return employee.workStatus == 100 && employee.employeeRole != 'intern';
        })
      );
    }
    if (this.accessibleBy.includes('PartTime')) {
      // accessible by full time employees only
      employeesList = employeesList.concat(
        employees.filter((employee) => {
          return employee.workStatus < 100 && employee.workStatus > 0 && employee.employeeRole != 'intern';
        })
      );
    }
    if (this.accessibleBy.includes('Intern')) {
      // accessible by full time employees only
      employeesList = employeesList.concat(
        employees.filter((employee) => {
          return employee.workStatus > 0 && employee.employeeRole == 'intern';
        })
      );
    }
    if (this.accessibleBy.includes('Custom')) {
      // custom access list
      employeesList = employeesList.concat(
        employees.filter((employee) => {
          if (customAccess) {
            return customAccess.includes(employee.id)
          } else {
            return this.accessibleBy.includes(employee.id);
          }
        })
      );
    }
    employeesList = [...new Set(employeesList)];

    return employeesList;
  }
}