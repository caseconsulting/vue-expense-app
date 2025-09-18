import { getTodaysDate, isBetween, isSameOrAfter } from '@/shared/dateUtils.js';

export class Reinvestigation {
  constructor(properties) {
    /** @type {string} */
    this.submissionDate = properties.submissionDate;
    /** @type {string} */
    this.completionDate = properties.completionDate;
  }

  get underReinvestigation() {
    return this.completionDate
    ? isBetween(getTodaysDate(), this.submissionDate, this.completionDate)
    : isSameOrAfter(getTodaysDate(), this.submissionDate);
  }

}