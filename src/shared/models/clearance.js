export class Clearance {

  constructor(properties) {
    /** @type {string[]} */
    this.adjudicationDates = properties.adjudicationDates;
    /** @type {boolean} */
    this.awaitingClearance = properties.awaitingClearance;
    /** @type {boolean} */
    this.reinvestigation = properties.reinvestigation;
    /** @type {string[]} */
    this.biDates = properties.biDates;
    /** @type {string[]} */
    this.polyDates = properties.polyDates;
    /** @type {string} */
    this.submissionDate = properties.submissionDate;
    /** @type {string} */
    this.type = properties.type;
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
    } else if (this.reinvestigation) {
      displayText = displayText + ' - Reinvestigation';
    }
    return displayText;
  }
}