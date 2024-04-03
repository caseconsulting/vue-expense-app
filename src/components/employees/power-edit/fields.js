const v = require('@/shared/validationUtils.js');

// prettier-ignore
export const TYPES = { DEFAULT: '0', DATE_MMYYYY: '1', DATE_MMDDYYYY: '2', CUSTOM: '3' };
// prettier-ignore
export let fields = [
  { title: 'First Name', key: 'firstName', selected: true, editType: TYPES.DEFAULT, infoType: TYPES.DEFAULT, rules: v.getRequiredRules() },
  { title: 'Last Name', key: 'lastName', selected: true, editType: TYPES.DEFAULT, infoType: TYPES.DEFAULT, rules: v.getRequiredRules() },
  { title: 'Nickname', key: 'nickname', selected: false, editType: TYPES.DEFAULT, infoType: TYPES.DEFAULT },
  { title: 'Middle Name', key: 'middleName', selected: false, editType: TYPES.DEFAULT, infoType: TYPES.DEFAULT },
  { title: 'Employee Number', key: 'employeeNumber', selected: true, editType: TYPES.DEFAULT, infoType: TYPES.DEFAULT },
  { title: 'AIN', key: 'agencyIdentificationNumber', selected: false, editType: TYPES.DEFAULT, infoType: TYPES.DEFAULT },
  { title: 'Hire Date', key: 'hireDate', selected: true, editType: TYPES.DATE_MMDDYYYY, infoType: TYPES.DATE_MMDDYYYY },
  { title: 'Work Status', key: 'workStatus', selected: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM },
  { title: 'Departure Date', key: 'deptDate', selected: false, editType: TYPES.DATE_MMDDYYYY, infoType: TYPES.DATE_MMDDYYYY },
  { title: 'Job Role', key: 'jobRole', selected: true, editType: TYPES.CUSTOM, infoType: TYPES.DEFAULT },
  { title: 'LinkedIn', key: 'linkedIn', selected: false },
  { title: 'Email', key: 'email', selected: false },
  { title: 'Awards', key: 'awards', selected: false },
  { title: 'Certifications', key: 'certifications', selected: false },
  { title: 'Clearances', key: 'clearances', selected: false },
  { title: 'Companies', key: 'companies', selected: false },
  { title: 'Contracts', key: 'contracts', selected: false },
  { title: 'Customer Org Exp', key: 'customerOrgExp', selected: false },
  { title: 'Education', key: 'educations', selected: false },
  { title: 'GitHub', key: 'github', selected: false },
  { title: 'IC Time Frames', key: 'icTimeFrames', selected: false },
  { title: 'Languages', key: 'languages', selected: false },
  { title: 'Personal Email', key: 'personalEmail', selected: false },
  { title: 'Public Phone Numbers', key: 'publicPhoneNumbers', selected: false },
  { title: 'Technologies', key: 'technologies', selected: false },
  { title: 'Twitter', key: 'twitter', selected: false },
  { title: 'Birthday', key: 'birthday', selected: false },
  { title: 'Birth City', key: 'city', selected: false },
  { title: 'Birth State', key: 'st', selected: false },
  { title: 'Birth Country', key: 'country', selected: false },
  { title: 'City', key: 'currentCity', selected: false },
  { title: 'State', key: 'currentState', selected: false },
  { title: 'Street', key: 'currentStreet', selected: false },
  { title: 'Street 2', key: 'currentStreet2', selected: false },
  { title: 'ZIP', key: 'currentZIP', selected: false },
  { title: 'Employee Role', key: 'employeeRole', selected: false },
  { title: 'Private Phone Numbers', key: 'privatePhoneNumbers', selected: false }
];
