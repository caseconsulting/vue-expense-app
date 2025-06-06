import { add, getTodaysDate, isAfter, isBefore, isSameOrBefore, isValid } from '@/shared/dateUtils';
import { isEmpty } from '@/utils/utils';
import _filter from 'lodash/filter';
import _find from 'lodash/find';
import _some from 'lodash/some';
import store from '../../store/index';

/**
 * Allow empty
 * Usage: `:rules="optional(getSomeOtherRules())"`
 * @param rules Array - rules to check if the value is not empty
 * @returns Array - rule to allow empty
 */
export function optional(rules) {
  return [(v) => isEmpty(v) || rules.find((rule) => rule(v) !== true)?.(v) || true];
}

/**
 * Gets the rules for valid AIN number, where it must be 7 digits that can lead with 0s, and not required
 * @returns Array - The array of rule functions
 */
export function getAINRules() {
  return [(v) => (!isEmpty(v) ? /^[0-9]{7}$/.test(v) || 'Agency Identification Number must be 7 digits' : true)];
} //getAINRules

/**
 * Gets the optional date rules in MM/DD/YYYY format.
 * @return Array - The array of rule functions
 */
export function getDateOptionalRules() {
  return [
    (v) => {
      return !isEmpty(v)
        ? (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) && isValid(v, 'MM/DD/YYYY')) || 'Date must be valid. Format: MM/DD/YYYY'
        : true;
    }
  ]; // rules for an optional date
} // getDateOptionalRules

/**
 * Birthday is valid if it's not specified or it's a valid date format
 */
export function getBirthdayRules() {
  const [nonFutureDateRule] = getNonFutureDateRules();
  return (v) => {
    if (isEmpty(v)) return true;
    return nonFutureDateRule(v);
  };
}

/**
 * Gets the optional dates rules for an array in MM/DD/YYYY format.
 * @return Array - The array of rule functions
 */
export function getDatesArrayOptionalRules() {
  return [
    (v) => {
      let allValid = _some(v, (date) => /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(date) && isValid(date, 'MM/DD/YYYY'));
      return !isEmpty(v) ? allValid || 'All Dates must be valid. Format: MM/DD/YYYY' : true;
    }
  ]; // rules for an optional date
} // getDateOptionalRules

/**
 * Gets the optional date rules in MM/YYYY format.
 * @return Array - The array of rule functions
 */
export function getDateMonthYearOptionalRules() {
  return [
    (v) => {
      return !isEmpty(v)
        ? (/[\d]{2}\/[\d]{4}/.test(v) && isValid(v, 'MM/YYYY')) || 'Date must be valid. Format: MM/YYYY'
        : true;
    }
  ]; // rules for an optional date
} // getDateMonthYearOptionalRules

/**
 * Gets the date rules in MM/DD/YYYY format.
 * @return Array - The array of rule functions
 */
export function getDateRules() {
  return [
    (v) =>
      (!isEmpty(v) && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) && isValid(v, 'MM/DD/YYYY')) ||
      'Date must be valid. Format: MM/DD/YYYY'
  ]; // rules for a required MM/DD/YYYY date
} // getDateRules

/**
 * Gets the date rules in MM/YYYY format.
 * @return Array - The array of rule functions
 */
export function getDateMonthYearRules() {
  // rules for a required MM/YYYY date
  return [
    (v) => (!isEmpty(v) && /[\d]{2}\/[\d]{4}/.test(v) && isValid(v, 'MM/YYYY')) || 'Date must be valid. Format: MM/YYYY'
  ];
} // getDateMonthYearRules

/**
 * Rule to ensure a date occurs before the specified date
 * @param {string} date Date to occur before
 */
export function getDateBeforeRule(date) {
  return (v) => {
    if (isEmpty(v) || isEmpty(date)) return true;
    return isAfter(add(date, 1, 'd'), v) || 'End date must be at or before start date';
  };
}

/**
 * Rule to ensure a date occurs after the specified date
 * @param {string} date Date to occur after
 */
export function getDateAfterRule(date) {
  return (v) => {
    if (isEmpty(v) || isEmpty(date)) return true;
    return isAfter(add(v, 1, 'd'), date) || 'End date must be at or before start date';
  };
}

/**
 * Gets the rules for a valid email address.
 *
 * @returns Array- the array of rule functions
 */
export function getEmailRules() {
  return [
    (v) =>
      !isEmpty(v)
        ? !!String(v)
            .toLowerCase()
            .match(
              /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            ) || 'Must be a valid email address'
        : true
  ];
} // getEmailRules

/**
 * Gets the rules for a valid employee email address
 *
 * @return {((v: any) => Boolean | String)[]} The array of rule functions
 */
export function getCaseEmailRules() {
  return [
    (v) => !isEmpty(v) || 'Email is required',
    (v) => /^[a-z\-0-9]+$/.test(v) || 'Can include numbers or lowercase letters'
  ];
}

/**
 * Gets the rules where a date must come before today's date.
 * @return Array - The array of rule functions
 */
export function getNonFutureDateRules() {
  return [(v) => isSameOrBefore(v, getTodaysDate('MM/DD/YYYY'), 'd') || 'Date must be today or earlier'];
} // getNonFutureDateRules

/**
 * Gets the rules where a whole number must be positive.
 * @return Array - The array of rule functions
 */
export function getNumberRules() {
  return [(v) => /^\d+$/.test(v) || 'Must be a positive number'];
} // getNumberRules

/**
 * Gets rules for phone numbers.
 * @return Array - The array of rule functions
 */
export function getPhoneNumberRules() {
  return [
    (v) =>
      /^\d{3}-\d{3}-\d{4}(?:, ext. \d{1,6})?$/.test(v) || 'Phone number must be valid. Format: ###-###-####, ext. ###'
  ];
} // getPhoneNumberRules

/**
 * Gets rules for phone numbers.
 * @return Array - The array of rule functions
 */
export function getPhoneNumberNoExtRules() {
  return [(v) => /^\d{3}-\d{3}-\d{4}?$/.test(v) || 'Phone number must be valid. Format: ###-###-####'];
} // getPhoneNumberNoExtRules

/**
 * Gets the rules where a whole number must be positive.
 * @return Array - The array of rule functions
 */
export function getPhoneNumberTypeRules() {
  return [(v) => !isEmpty(v) || 'Must choose one selection'];
} // getPhoneNumberTypeRules

/**
 * Gets the rules where a field is required and must not be empty.
 * @return Array - The array of rule functions
 */
export function getRequiredRules() {
  return [(v) => !isEmpty(v) || 'This field is required']; // rules for a required field
} // getRequiredRules

/**
 * Gets the rules for unanet person key
 * @return Array - The array of rule functions
 */
export function getUnanetPersonKeyRules() {
  return [(v) => (!isEmpty(v) ? /^[0-9]*$/.test(v) || 'Must be a number' : true)];
}

/**
 * Gets the URL rules
 * @return Array - The array of rule functions
 */
export function getURLRules() {
  return [
    (v) =>
      isEmpty(v) ||
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.test(v) ||
      'URL must be valid. Only http(s) are accepted.'
  ]; // rules for training url
} // getURLRules

/**
 * Gets the rules for validating employee hire/departure dates
 * @returns Array - The array of rule functions
 */
export function getValidateFalse() {
  return [(v) => isEmpty(v) || 'Departure date must be after hire date'];
} // getValidateRules

export function duplicateEmployeeNumberRule() {
  return [
    (v, employee) => {
      let emp = _find(store.getters.employees, (e) => e.id === employee.id);
      let duplicate = _some(store.getters.employees, (e) => {
        return Number(e.employeeNumber) === Number(v) && Number(emp.employeeNumber) !== Number(v);
      });
      return !duplicate || 'This employee id is already in use';
    }
  ];
}

export function duplicateTechnologyRules() {
  return [
    (v, employee, technologies) => {
      let duplicates = _filter(technologies, (t) => t.name === v);
      return duplicates.length === 0 || 'Duplicate technology found';
    }
  ];
}

/**
 * Rules for no duplication of tech/skill names (used in employee beta profile)
 */
export function getDuplicateTechRules(technologies) {
  return [
    (v) => {
      let count = 0;
      for (let i = 0; i < technologies.length && count <= 2; i++) {
        if (technologies[i].name === v) count++;
      }
      return count <= 1 || 'Duplicate technology found, please remove duplicate entries';
    }
  ];
}

export function technologyExperienceRules() {
  return [
    (v) => v === Number(v) || 'Value must be a number',
    (v) => (String(v).split('.')[1]?.length || 0) <= 2 || 'Value must be 2 decimal places or less',
    (v, techObj) => v > 0 || techObj.current || 'Value must be greater than 0',
    (v) => v < 100 || 'Value must be less than 100'
  ];
}

export function getDateBadgeRules(clearance) {
  return [
    (v) => {
      return v && clearance.grantedDate && clearance.submissionDate
        ? (isAfter(v, clearance.grantedDate) && isAfter(v, clearance.submissionDate)) ||
            'Badge expiration date must come after grant and submission date'
        : true;
    }
  ];
}

export function getDateSubmissionRules(clearance) {
  return [
    (v) =>
      v && clearance.grantedDate
        ? isBefore(v, clearance.grantedDate) || 'Submission date must be before grant date'
        : true
  ];
}

export function getDateGrantedRules(clearance) {
  return [
    (v) =>
      v && clearance.submissionDate
        ? isAfter(clearance.grantedDate, clearance.submissionDate) || 'Grant date must be after the submission date'
        : true
  ];
}

export function getAfterSubmissionRules(clearance) {
  return [
    (v) =>
      !isEmpty(v)
        ? !_some(v, (date) => isBefore(date, clearance.submissionDate)) || 'Dates must come after submission date'
        : true
  ];
}

/**
 * Rules preventing duplicate clearanace types
 *
 * @param clearanceTypes List of all an employee's clearances
 */
export function getDuplicateClearanceRules(clearances) {
  return [
    (v) => {
      let count = 0;
      for (let i = 0; i < clearances.length && count <= 2; i++) {
        if (clearances[i].type === v) count++;
      }
      return count <= 1 || 'Cannot have two of the same clearance type';
    }
  ];
}

/**
 * Gets the rules for validating employee PTO Cash Out request
 * @param ptoLimit employee's available PTO
 * @param employeeId employee's ID
 * @param originalAmount the cash out items original amount before editing
 * @returns Array - The array of rule functions
 */
export function getPTOCashOutRules(ptoLimit, employeeId, originalAmount) {
  let pendingCashOuts = _filter(store.getters.ptoCashOuts, (p) => !p.approvedDate && employeeId === p.employeeId);
  let pendingAmount = pendingCashOuts.reduce((n, { amount }) => n + amount, 0);
  return [
    (v) => (!isEmpty(v) && v > 0) || `PTO cash out amount must be greater than 0`,
    (v) => {
      let amount = originalAmount ? v - originalAmount : Number(v);
      return (
        (!isEmpty(v) && ptoLimit - amount - pendingAmount >= 40) ||
        'A minimum balance of 40h must be maintained after a cash out'
      );
    }
  ];
} // getPTOCashOutRules

/**
 * Validate (numbers and letters) input field for badge number.
 */
export function getBadgeNumberRules(clearance) {
  const pattern = /^[A-Za-z0-9]*$/;
  return (v) =>
    v && clearance.badgeNum
      ? (pattern.test(clearance.badgeNum) && clearance.badgeNum.length == 5) || 'Invalid Badge #, Must be 5 characters'
      : true;
} //getBadgeNumberRules

/**
 * Rule that specifies that no two contracts can have both the same contract and prime name
 * @param {*} contract The contract object
 */
export function getDuplicateContractAndPrimeRule(contract) {
  return () => {
    const allContracts = store.getters.contracts;
    let count = 0;
    for (let i = 0; i < allContracts.length && count <= 2; i++) {
      if (allContracts[i].contractName === contract.contractName && allContracts[i].primeName === contract.primeName)
        count++;
    }
    return count <= 1 || 'Duplicate contract and prime combination';
  };
}

/**
 * Rule that specifies that there can be no duplicate projects within the same contract
 * @param {*} contract The contract object
 */
export function getDuplicateProjectRule(contract) {
  return (v) => {
    let count = 0;
    for (let i = 0; i < contract.projects.length && count <= 2; i++) {
      if (contract.projects[i].projectName === v) count++;
    }
    return count <= 1 || 'Duplicate projects found within this contract, please remove duplicate entries';
  };
}

/**
 * Rule that specifies no dupilcate company names
 * @param companies All companies of the employee
 */
export function getDuplicateCompanyNameRule(companies) {
  return (v) => {
    let count = 0;
    for (let i = 0; i < companies.length && count <= 2; i++) {
      if (companies[i].companyName === v) count++;
    }
    return count <= 1 || 'Duplicate company name found, please remove duplicate entries';
  };
}

export function getDuplicateCustomerOrgRule(customerOrgs) {
  return (v) => {
    let count = 0;
    for (let i = 0; i < customerOrgs.length && count <= 2; i++) {
      if (customerOrgs[i].name === v) count++;
    }
    return count <= 1 || 'Duplicate customer org found, please remove duplicate entries';
  };
}

export function getWorkStatusRules() {
  return [
    (v) => !isEmpty(v) || 'This field is required',
    (v) => (v !== '0' && v !== '00') || 'Value cannot be 0 (set to inactive instead)'
  ];
}

export default {
  getAINRules,
  getDateOptionalRules,
  getDatesArrayOptionalRules,
  getDateMonthYearOptionalRules,
  getDateRules,
  getDateMonthYearRules,
  getDateBadgeRules,
  getEmailRules,
  getNonFutureDateRules,
  getNumberRules,
  getPhoneNumberRules,
  getPhoneNumberTypeRules,
  getRequiredRules,
  getURLRules,
  getValidateFalse,
  getDateSubmissionRules,
  getDateGrantedRules,
  getAfterSubmissionRules,
  getDuplicateClearanceRules,
  duplicateEmployeeNumberRule,
  duplicateTechnologyRules,
  technologyExperienceRules,
  getPTOCashOutRules,
  getBadgeNumberRules,
  getCaseEmailRules,
  getDuplicateContractAndPrimeRule,
  getDuplicateProjectRule,
  getDuplicateCompanyNameRule,
  getDuplicateCustomerOrgRule,
  getWorkStatusRules,
  getUnanetPersonKeyRules
};
