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
   * @param {object} properties An object that contains properties of this employee (see the class definition for optional properties)
   */
  constructor(properties) {
    // ==== REQUIRED PROPERTIES ====

    /** @type {string} */
    this.id = properties.id;

    /** @type {string} */
    this.email = properties.email;

    /** @type {number} */
    this.employeeNumber = properties.employeeNumber;

    /** @type {string} */
    this.firstName = properties.firstName;

    /** @type {string} */
    this.lastName = properties.lastName;

    /** @type {string} */
    this.hireDate = properties.hireDate;

    /** @type {number} */
    this.workStatus = properties.workStatus;

    // ==== OPTIONAL PROPERTIES ====

    /** @type {string} */
    this.agencyIdentificationNumber = properties.agencyIdentificationNumber ?? '';

    /** @type {Award[]} */
    this.awards = properties.awards ?? [];

    /** @type {boolean} */
    this.birthdayFeed = properties.birthdayFeed ?? false;

    /** @type {Certification[]} */
    this.certifications = properties.certifications ?? [];

    /** @type {Clearance[]} */
    this.clearances = properties.clearances ?? [];

    /** @type {Company[]} */
    this.companies = properties.companies ?? [];

    /** @type {Contract} */
    this.contract = properties.contract ?? '';

    /** @type {Contract[]} */
    this.contracts = properties.contracts ?? [];

    /** @type {CustomerOrg[]} */
    this.customerOrgExp = properties.customerOrgExp ?? '';

    /** @type {string} */
    this.cykAoid = properties.cykAoid ?? '';

    /** @type {string} */
    this.deptDate = properties.deptDate ?? '';

    /** @type {Education[]} */
    this.education = properties.education ?? [];

    /** @type {string} */
    this.github = properties.github ?? '';

    /** @type {{range = string[]}} */
    this.icTimeFrames = properties.icTimeFrames ?? [];

    /** @type {string} */
    this.jobRole = properties.jobRole ?? '';

    /** @type {Language[]} */
    this.languages = properties.languages ?? [];

    /** @type {string} */
    this.lastLogin = properties.lastLogin ?? '';

    /** @type {string} */
    this.linkedIn = properties.linkedIn ?? '';

    /** @type {string} */
    this.middleName = properties.middleName ?? '';

    /** @type {string} */
    this.nickname = properties.nickname ?? '';

    /** @type {string} */
    this.noMiddleName = properties.noMiddleName ?? '';

    /** @type {string} */
    this.prime = properties.prime ?? '';

    /** @type {string} */
    this.personalEmail = properties.personalEmail ?? '';

    /** @type {PhoneNumber[]} */
    this.publicPhoneNumbers = properties.publicPhoneNumbers ?? [];

    /** @type {string} */
    this.resumeUpdated = properties.resumeUpdated ?? '';

    /** @type {string[]} */
    this.schools = properties.schools ?? [];

    /** @type {Technology[]} */
    this.technologies = properties.contracts ?? [];

    /** @type {string} */
    this.twitter = properties.twitter ?? '';

    /** @type {string} */
    this.mifiStatus = properties.mifiStatus ?? ''; // note: this one might not be needed

    /** @type {{date: string, holidayHours: number, ptoHours: number}[]} */
    this.plannedPto = properties.plannedPto ?? '';

    // current address fields
    /** @type {string} */
    this.currentStreet = properties.currentStreet ?? '';

    /** @type {string} */
    this.currentStreet2 = properties.currentStreet2 ?? '';

    /** @type {string} */
    this.currentCity = properties.currentCity ?? '';

    /** @type {string} */
    this.currentState = properties.currentState ?? '';

    /** @type {string} */
    this.currentZIP = properties.currentZIP ?? '';
    // end current address fields

    // ==== SENSITIVE DATA ====

    /** @type {string} */
    this.birthday = properties.birthday ?? '';

    /** @type {boolean} */
    this.employeeRole = 'admin';

    /** @type {PhoneNumber[]} */
    this.privatePhoneNumbers = properties.privatePhoneNumbers ?? [];

    // place of birth fields
    /** @type {string} */
    this.st = properties.st ?? '';

    /** @type {string} */
    this.city = properties.city ?? '';

    /** @type {string} */
    this.country = properties.country ?? '';
    // end place of birth fields

    // eeo fields
    /** @type {boolean} */
    this.eeoAdminHasFilledOutEeoForm = properties.eeoAdminHasFilledOutEeoForm ?? false;

    /** @type {boolean} */
    this.eeoDeclineSelfIdentify = properties.eeoDeclineSelfIdentify ?? false;

    /** @type {{text: string, value: boolean}} */
    this.eeoGender = properties.eeoGender ?? null;

    /** @type {boolean} */
    this.eeoHasDisability = properties.eeoHasDisability ?? false;

    /** @type {{text: string, value: boolean}} */
    this.eeoHispanicOrLatino = properties.eeoHispanicOrLatino ?? null;

    /** @type {boolean} */
    this.eeoIsProtectedVeteran = properties.eeoHasDisability ?? false;

    /** @type {{text: string, value: number}} */
    this.eeoJobCategory = properties.eeoJobCategory ?? null;

    /** @type {{text: string, value: number}} */
    this.eeoRaceOrEthnicity = properties.eeoRaceOrEthnicity ?? null;
    // end eeo fields
  }
}
