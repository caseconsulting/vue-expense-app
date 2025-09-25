import { Base } from '@/models/expense-types/base.js';
import { isEmpty } from '@/utils/utils';

export class Category extends Base {
  constructor(properties, fromExpenseType = false) {
    super();
    /** @type {string} */
    this.cc = properties.cc;
    /** @type {string} */
    this.bcc = properties.bcc;
    /** @type {string} */
    this.name = fromExpenseType ? '' : properties.name;
    /** @type {string} */
    this.replyTo = properties.replyTo;
    /** @type {boolean} */
    this.requireURL = properties.requireURL ?? false;
    /** @type {boolean} */
    this.requireReceipt = properties.requireReceipt ?? false;
    /** @type {boolean} */
    this.showOnFeed = properties.showOnFeed ?? false;
    /** @type {string} */
    this.to = properties.to;

    return new Proxy(this, {
      set(target, key, value) {
        target[key] = value;
        switch (key) {
          case 'to':
            if (isEmpty(value)) {
              target.clearEmails();
            }
            break;
        }
        return true;
      }
    });
  }
}
