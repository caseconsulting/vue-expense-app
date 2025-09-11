import { Reinvestigation } from '@/shared/models/clearance/reinvestigation.js';
export class Clearance {

  constructor(properties) {
    /** @type {string[]} */
    this.adjudicationDates = properties.adjudicationDates;
    /** @type {boolean} */
    this.awaitingClearance = properties.awaitingClearance;
    /** @type {string} */
    this.badgeExpirationDate = properties.badgeExpirationDate;
    /** @type {string} */
    this.badgeNum = properties.badgeNum;
    /** @type {string[]} */
    this.biDates = properties.biDates;
    /** @type {string} */
    this.grantedDate = properties.grantedDate;
    /** @type {string} */
    this.grantingOrg = properties.grantingOrg;
    /** @type {string[]} */
    this.polyDates = properties.polyDates;
    /** @type {Reinvestigation[]} */
    let reinvestigations = properties.reinvestigations ?? [];
    this.reinvestigations = reinvestigations.map((r) => new Reinvestigation(r));
    /** @type {string} */
    this.submissionDate = properties.submissionDate;
    /** @type {string} */
    this.type = properties.type;
  }

  get underReinvestigation() {
    return this.reinvestigations.some((r) => r.underReinvestigation);
  }
  /**
   * Returns the type of clearance
   *
   * @param {*} clearance The clearance object
   * @return String - clearance type
   */
  get displayText() {
    let displayText = this.type;
    if (this.awaitingClearance) {
      displayText = displayText + ' - Awaiting Clearance';
    } else if (this.underReinvestigation) {
      displayText = displayText + ' - Reinvestigation';
    }
    return displayText;
  }
}