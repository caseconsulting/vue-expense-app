/* eslint-disable no-unused-labels */
// TODO remove this ^^

// Defines several data types used in the employees database

/**
 * @typedef {Object} Award
 * @property {string} dateReceived
 * @property {string} dateSubmitted
 * @property {string} name
 * @property {string} showExpirationMenu
 */

/**
 * @typedef {Object} Certification
 * @property {string} dateReceived
 * @property {string} dateSubmitted
 * @property {string} expirationDate
 * @property {string} expirationWasSeen
 * @property {string} name
 */

/**
 * @typedef {Object} Clearance
 * @property {string[]} adjudicationDates
 * @property {boolean} awaitingClearance
 * @property {string[]} biDates
 * @property {string[]} polyDates
 * @property {string} submissionDate
 * @property {string} type
 */

/**
 * @typedef {Object} Company
 * @property {string} companyName
 * @property {{
 *   endDate: string,
 *   presentDate: boolean,
 *   startDate: string,
 *   title: string
 * }[]} positions
 */

/**
 * @typedef {Object} Contract
 * @property {string} contractId
 * @property {boolean} current
 * @property {{
 *   endDate: string,
 *   presentDate: string,
 *   projectId: string,
 *   showEndMenu: boolean,
 *   showStartMenu: boolean,
 *   startDate: string
 * }[]} projects
 * @property {number} years
 */

/**
 * @typedef {Object} CustomerOrg
 * @property {boolean} current
 * @property {string} name
 * @property {number} years
 */

/**
 * @typedef {Object} Education
 * @property {string} id
 * @property {Degree[]} degrees
 * @property {string} name
 * @property {string} type
 */

/**
 * @typedef {Object} Degree
 * @property {string} completionDate
 * @property {any[]} concentrations
 * @property {string} degreeType
 * @property {string[]} majors
 * @property {string[]} minors
 * @property {boolean} showEducationMenu
 */

/**
 * @typedef {Object} Language
 * @property {string} name
 * @property {string} proficiency
 */

/**
 * @typedef {Object} PhoneNumber
 * @property {string} number
 * @property {boolean} private
 * @property {string} type
 * @property {boolean} valid
 */

/**
 * @typedef {Object} Technology
 * @property {boolean} current
 * @property {string} name
 * @property {number} years
 */

export class Employee {
  /**
   * Creates a new employee
   * @param {{
   * id: string,
   * email: string,
   * employeeNumber: number,
   * firstName: string,
   * lastName: string,
   * hireDate: string,
   * workStatus: number
   * }} properties An object defining properties of this employee (only required properties are listed in the doc)
   */
  constructor(properties) {
    // ==== required properties ====

    /** @type {string} */ id: properties.id;
    /** @type {string} */ email: properties.email;
    /** @type {number} */ employeeNumber: properties.employeeNumber;
    /** @type {string} */ firstName: properties.firstName;
    /** @type {string} */ lastName: properties.lastName;
    /** @type {string} */ hireDate: properties.hireDate;
    /** @type {number} */ workStatus: properties.workStatus;

    // ==== optional properties ====

    agencyIdentificationNumber: properties.agencyIdentificationNumber ?? '';

    /** @type {Award[]} */
    awards: properties.awards ?? [];

    birthdayFeed: properties.birthdayFeed ?? false;

    /** @type {Certification[]} */
    certifications: properties.certifications ?? [];

    /** @type {Clearance[]} */
    clearances: properties.clearances ?? [];

    /** @type {Company[]} */
    companies: properties.companies ?? [];

    /** @type {Contract} */
    contract: properties.contract ?? '';

    /** @type {Contract[]} */
    contracts: properties.contracts ?? [];

    /** @type {CustomerOrg[]} */
    customerOrgExp: properties.customerOrgExp ?? '';

    cykAoid: properties.cykAoid ?? '';

    degrees: properties.degrees ?? []; // note: this looks unused in the database

    deptDate: properties.deptDate ?? '';

    /** @type {Education[]} */
    education: properties.education ?? [];

    github: properties.github ?? '';

    /** @type {{range: string[]}} */
    icTimeFrames: properties.icTimeFrames ?? [];

    jobRole: properties.jobRole ?? '';

    jobs: properties.jobs ?? []; // note: this looks unused in the database

    /** @type {Language[]} */
    languages: properties.languages ?? [];

    lastLogin: properties.lastLogin ?? '';

    linkedIn: properties.linkedIn ?? '';

    middleName: properties.middleName ?? '';

    nickname: properties.nickname ?? '';

    noMiddleName: properties.noMiddleName ?? '';

    prime: properties.prime ?? '';

    personalEmail: properties.personalEmail ?? '';

    /** @type {PhoneNumber[]} */
    publicPhoneNumbers: properties.publicPhoneNumbers ?? '';

    resumeUpdated: properties.resumeUpdated ?? '';

    /** @type {string[]} */
    schools: properties.schools ?? [];

    /** @type {Technology[]} */
    technologies: properties.contracts ?? [];

    twitter: properties.twitter ?? '';

    mifiStatus: properties.mifiStatus ?? ''; // note: this one might not be needed

    /**
     * @type {{
     *   date: string, holidayHours: number, ptoHours: number}[]
     * }
     */
    plannedPto: properties.plannedPto ?? '';

    // place of birth
    st: properties.st ?? '';
    city: properties.city ?? '';
    country: properties.country ?? '';

    // current address
    currentStreet: properties.currentStreet ?? '';
    currentStreet2: properties.currentStreet2 ?? '';
    currentCity: properties.currentCity ?? '';
    currentState: properties.currentState ?? '';
    currentZIP: properties.currentZIP ?? '';
  }
}
